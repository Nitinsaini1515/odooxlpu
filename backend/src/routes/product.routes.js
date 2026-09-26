const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Warehouse = require('../models/Warehouse');
const Order = require('../models/Order');
const StockLedger = require('../models/StockLedger');
const { protect, restrictTo } = require('../middleware/auth');

// Get all products with calculated stock and status
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, stockStatus, warehouseId } = req.query;

    let filter = { isActive: true };
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // Attach stock levels per product
    const productData = await Promise.all(
      products.map(async (prod) => {
        let stockQuery = { product: prod._id };
        if (warehouseId && warehouseId !== 'all') {
          stockQuery.warehouse = warehouseId;
        }

        const stocks = await Stock.find(stockQuery).populate('warehouse', 'name code');
        const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);
        const reservedStock = stocks.reduce((sum, s) => sum + (s.reservedQuantity || 0), 0);
        const availableStock = Math.max(0, totalStock - reservedStock);

        let status = 'IN_STOCK';
        if (totalStock === 0) {
          status = 'OUT_OF_STOCK';
        } else if (totalStock <= prod.minStockLevel) {
          status = 'LOW_STOCK';
        }

        return {
          ...prod.toObject(),
          totalStock,
          reservedStock,
          availableStock,
          status,
          stockByWarehouse: stocks.map((s) => ({
            warehouseId: s.warehouse?._id,
            warehouseName: s.warehouse?.name,
            warehouseCode: s.warehouse?.code,
            quantity: s.quantity,
            reservedQuantity: s.reservedQuantity || 0,
            aisleLocation: s.aisleLocation,
          })),
        };
      })
    );

    // Filter by stock status if requested
    let results = productData;
    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'low') {
        results = results.filter((p) => p.status === 'LOW_STOCK');
      } else if (stockStatus === 'out') {
        results = results.filter((p) => p.status === 'OUT_OF_STOCK');
      } else if (stockStatus === 'in') {
        results = results.filter((p) => p.status === 'IN_STOCK');
      }
    }

    return res.json({ success: true, count: results.length, products: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product detail
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const stocks = await Stock.find({ product: product._id }).populate('warehouse', 'name code city');
    const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);

    return res.json({
      success: true,
      product: {
        ...product.toObject(),
        totalStock,
        stocks,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get product-wise sales history
router.get('/:id/sales-history', protect, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find all orders containing this product
    const orders = await Order.find({ 'items.product': productId })
      .sort({ createdAt: -1 })
      .populate('fulfillmentWarehouse', 'name code');

    // Extract item sales records
    const salesRecords = [];
    let totalUnitsSold = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    orders.forEach((order) => {
      const item = order.items.find((i) => i.product.toString() === productId);
      if (item) {
        totalUnitsSold += item.quantity;
        totalRevenue += item.subtotal;
        totalProfit += item.profit;

        salesRecords.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          date: order.createdAt,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          subtotal: item.subtotal,
          profit: item.profit,
          status: order.status,
          warehouse: order.fulfillmentWarehouse?.name || 'Default',
        });
      }
    });

    // Recent stock movements for this product
    const ledger = await StockLedger.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('warehouse', 'name code')
      .populate('performedBy', 'name');

    return res.json({
      success: true,
      product,
      stats: {
        totalUnitsSold,
        totalRevenue,
        totalProfit,
        orderCount: salesRecords.length,
        averageSellingPrice: totalUnitsSold > 0 ? Math.round(totalRevenue / totalUnitsSold) : product.sellingPrice,
      },
      sales: salesRecords,
      ledger,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create product (Manager or Staff)
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      minStockLevel,
      maxStockLevel,
      initialStock,
      initialWarehouseId,
      description,
      material,
      dimensions,
      color,
      imageUrl,
      leadTimeDays,
    } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: `SKU '${sku}' is already taken` });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      category: category || 'Living Room',
      unit: unit || 'pcs',
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      minStockLevel: Number(minStockLevel) || 10,
      maxStockLevel: Number(maxStockLevel) || 100,
      leadTimeDays: Number(leadTimeDays) || 7,
      description: description || '',
      material: material || 'Solid Teak & Fabric',
      dimensions: dimensions || 'Standard',
      color: color || 'Natural Wood / Matte Black',
      imageUrl: imageUrl || '',
    });

    // Create initial stock in warehouses
    const warehouses = await Warehouse.find({ isActive: true });
    let defaultWarehouse = initialWarehouseId
      ? warehouses.find((w) => w._id.toString() === initialWarehouseId)
      : warehouses.find((w) => w.isDefault) || warehouses[0];

    if (!defaultWarehouse && warehouses.length > 0) {
      defaultWarehouse = warehouses[0];
    }

    if (defaultWarehouse) {
      const initQty = Number(initialStock) || 0;
      await Stock.create({
        product: product._id,
        warehouse: defaultWarehouse._id,
        quantity: initQty,
      });

      if (initQty > 0) {
        await StockLedger.create({
          transactionType: 'INITIAL_STOCK',
          product: product._id,
          warehouse: defaultWarehouse._id,
          deltaQuantity: initQty,
          balanceAfter: initQty,
          totalSystemBalanceAfter: initQty,
          unitCost: product.purchasePrice,
          reference: 'INIT-PRODUCT',
          performedBy: req.user._id,
          notes: 'Initial inventory upon product onboarding',
        });
      }

      // Initialize 0 stock entries for other warehouses
      for (const wh of warehouses) {
        if (wh._id.toString() !== defaultWarehouse._id.toString()) {
          await Stock.create({
            product: product._id,
            warehouse: wh._id,
            quantity: 0,
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.body.sku) {
      req.body.sku = req.body.sku.toUpperCase();
      const existing = await Product.findOne({ sku: req.body.sku, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'SKU already in use by another product' });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Soft delete product (Manager only)
router.delete('/:id', protect, restrictTo('manager'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
