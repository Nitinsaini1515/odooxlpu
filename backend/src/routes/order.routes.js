const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Warehouse = require('../models/Warehouse');
const StockLedger = require('../models/StockLedger');
const InventoryOperation = require('../models/InventoryOperation');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Generate Sales Order Code
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SO-${dateStr}-${rand}`;
};

// GET all orders
router.get('/', protect, async (req, res) => {
  try {
    const { status, warehouseId, search, limit = 50, page = 1 } = req.query;

    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (warehouseId && warehouseId !== 'all') {
      filter.fulfillmentWarehouse = warehouseId;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('fulfillmentWarehouse', 'name code city')
      .populate('items.product', 'name sku category imageUrl')
      .populate('createdBy', 'name role');

    return res.json({
      success: true,
      total,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('fulfillmentWarehouse')
      .populate('items.product')
      .populate('createdBy', 'name email role');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST Create new customer order
router.post('/', protect, async (req, res) => {
  try {
    const { customer, items, fulfillmentWarehouseId, notes } = req.body;

    if (!customer?.name || !items || !items.length || !fulfillmentWarehouseId) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, fulfillment warehouse, and order items are required',
      });
    }

    const warehouse = await Warehouse.findById(fulfillmentWarehouseId);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Fulfillment warehouse not found' });
    }

    let totalAmount = 0;
    let totalCost = 0;
    const processedItems = [];

    // Verify stock and compute pricing
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const qty = Number(item.quantity);
      if (qty <= 0) continue;

      const sellPrice = Number(item.sellingPrice) || product.sellingPrice;
      const buyPrice = product.purchasePrice;
      const subtotal = sellPrice * qty;
      const itemCost = buyPrice * qty;
      const itemProfit = subtotal - itemCost;

      totalAmount += subtotal;
      totalCost += itemCost;

      processedItems.push({
        product: product._id,
        quantity: qty,
        purchasePrice: buyPrice,
        sellingPrice: sellPrice,
        subtotal: subtotal,
        profit: itemProfit,
      });

      // Update reserved quantity in warehouse stock
      let stock = await Stock.findOne({ product: product._id, warehouse: warehouse._id });
      if (stock) {
        stock.reservedQuantity = (stock.reservedQuantity || 0) + qty;
        await stock.save();
      }
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      customer: {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || 'Jalandhar',
      },
      items: processedItems,
      totalAmount,
      totalCost,
      totalProfit: totalAmount - totalCost,
      status: 'pending',
      fulfillmentWarehouse: warehouse._id,
      notes: notes || '',
      createdBy: req.user._id,
    });

    // Notify Manager of new incoming order
    await Notification.create({
      title: `New Customer Order: ${orderNumber}`,
      message: `Order received from ${customer.name} for ₹${totalAmount.toLocaleString('en-IN')}`,
      type: 'order',
      targetRole: 'manager',
      link: `/orders`,
    });

    return res.status(201).json({
      success: true,
      message: `Order ${orderNumber} placed successfully`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT Update order status (pending -> confirmed -> ready -> delivered -> cancelled)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.status;
    if (oldStatus === status) {
      return res.json({ success: true, message: 'Status already set', order });
    }

    if (oldStatus === 'delivered') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be modified' });
    }

    order.status = status;

    if (status === 'confirmed') {
      order.confirmedAt = new Date();
    } else if (status === 'ready') {
      order.readyAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();

      // Deduct actual physical stock from warehouse and record stock ledger + delivery operation
      const warehouse = await Warehouse.findById(order.fulfillmentWarehouse);
      const deliveryItems = [];

      for (const item of order.items) {
        let stock = await Stock.findOne({ product: item.product._id, warehouse: order.fulfillmentWarehouse });
        if (stock) {
          stock.quantity = Math.max(0, stock.quantity - item.quantity);
          stock.reservedQuantity = Math.max(0, (stock.reservedQuantity || 0) - item.quantity);
          await stock.save();

          const allStocks = await Stock.find({ product: item.product._id });
          const totalSystemStock = allStocks.reduce((sum, s) => sum + s.quantity, 0);

          await StockLedger.create({
            transactionType: 'ORDER_FULFILLMENT',
            product: item.product._id,
            warehouse: order.fulfillmentWarehouse,
            deltaQuantity: -item.quantity,
            balanceAfter: stock.quantity,
            totalSystemBalanceAfter: totalSystemStock,
            unitCost: item.product.purchasePrice,
            reference: order.orderNumber,
            performedBy: req.user._id,
            notes: `Customer Order fulfillment for ${order.customer.name}`,
          });

          deliveryItems.push({
            product: item.product._id,
            quantity: item.quantity,
            unitPrice: item.sellingPrice,
          });

          // Low stock alert check
          if (totalSystemStock <= item.product.minStockLevel) {
            await Notification.create({
              title: `Low Stock: ${item.product.name}`,
              message: `Total stock is now ${totalSystemStock} after fulfilling ${order.orderNumber}`,
              type: 'low_stock',
              targetRole: 'manager',
              link: `/smart-insights`,
            });
          }
        }
      }

      // Auto-create Delivery Operation record
      await InventoryOperation.create({
        operationNumber: `DEL-${order.orderNumber}`,
        type: 'delivery',
        status: 'completed',
        sourceWarehouse: order.fulfillmentWarehouse,
        items: deliveryItems,
        partnerName: order.customer.name,
        reference: order.orderNumber,
        notes: `Order fulfillment delivery to ${order.customer.address || order.customer.city}`,
        performedBy: req.user._id,
        completedAt: new Date(),
      });
    } else if (status === 'cancelled') {
      // Release reserved stock
      for (const item of order.items) {
        let stock = await Stock.findOne({ product: item.product._id, warehouse: order.fulfillmentWarehouse });
        if (stock) {
          stock.reservedQuantity = Math.max(0, (stock.reservedQuantity || 0) - item.quantity);
          await stock.save();
        }
      }
    }

    await order.save();

    // Create staff/manager notification
    await Notification.create({
      title: `Order ${order.orderNumber} Status: ${status.toUpperCase()}`,
      message: `Order for ${order.customer.name} was moved to ${status} by ${req.user.name}`,
      type: 'order',
      targetRole: 'all',
      link: `/orders`,
    });

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
