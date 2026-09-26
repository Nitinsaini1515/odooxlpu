const express = require('express');
const router = express.Router();
const InventoryOperation = require('../models/InventoryOperation');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to generate operation number
const generateOpCode = (prefix) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}-${random}`;
};

// GET Operations list with filters
router.get('/operations', protect, async (req, res) => {
  try {
    const { type, status, warehouseId, limit = 50, page = 1 } = req.query;

    let filter = {};
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (warehouseId && warehouseId !== 'all') {
      filter.$or = [{ sourceWarehouse: warehouseId }, { destinationWarehouse: warehouseId }];
    }

    const operations = await InventoryOperation.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('items.product', 'name sku category unit purchasePrice sellingPrice')
      .populate('performedBy', 'name role');

    const total = await InventoryOperation.countDocuments(filter);

    return res.json({
      success: true,
      total,
      operations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET single operation detail
router.get('/operations/:id', protect, async (req, res) => {
  try {
    const operation = await InventoryOperation.findById(req.params.id)
      .populate('sourceWarehouse', 'name code city address')
      .populate('destinationWarehouse', 'name code city address')
      .populate('items.product')
      .populate('performedBy', 'name email role');

    if (!operation) {
      return res.status(404).json({ success: false, message: 'Operation not found' });
    }

    return res.json({ success: true, operation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 1. RECEIPTS: Incoming stock increases inventory
router.post('/receipts', protect, async (req, res) => {
  try {
    const { destinationWarehouseId, supplierName, reference, notes, items } = req.body;

    if (!destinationWarehouseId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Destination warehouse and at least one item are required' });
    }

    const warehouse = await Warehouse.findById(destinationWarehouseId);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Destination warehouse not found' });
    }

    const opCode = generateOpCode('REC');
    const processedItems = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const qty = Number(item.quantity);
      if (qty <= 0) continue;

      // Update or create Stock
      let stock = await Stock.findOne({ product: product._id, warehouse: warehouse._id });
      if (!stock) {
        stock = new Stock({ product: product._id, warehouse: warehouse._id, quantity: 0 });
      }

      stock.quantity += qty;
      await stock.save();

      // Total balance after
      const allStocks = await Stock.find({ product: product._id });
      const totalSystemStock = allStocks.reduce((sum, s) => sum + s.quantity, 0);

      // Ledger entry
      await StockLedger.create({
        transactionType: 'RECEIPT',
        product: product._id,
        warehouse: warehouse._id,
        deltaQuantity: qty,
        balanceAfter: stock.quantity,
        totalSystemBalanceAfter: totalSystemStock,
        unitCost: Number(item.unitCost) || product.purchasePrice,
        reference: opCode,
        performedBy: req.user._id,
        notes: `Receipt from ${supplierName || 'Supplier'} - Ref: ${reference || 'N/A'}`,
      });

      processedItems.push({
        product: product._id,
        quantity: qty,
        unitPrice: Number(item.unitCost) || product.purchasePrice,
      });
    }

    const operation = await InventoryOperation.create({
      operationNumber: opCode,
      type: 'receipt',
      status: 'completed',
      destinationWarehouse: warehouse._id,
      items: processedItems,
      partnerName: supplierName || 'General Supplier',
      reference: reference || '',
      notes: notes || '',
      performedBy: req.user._id,
      completedAt: new Date(),
    });

    // Notify Manager
    await Notification.create({
      title: `Stock Receipt Completed (${opCode})`,
      message: `${req.user.name} received ${processedItems.length} product line(s) into ${warehouse.name}`,
      type: 'operation',
      targetRole: 'manager',
      link: `/inventory/operations`,
    });

    return res.status(201).json({
      success: true,
      message: `Receipt ${opCode} successfully processed and inventory updated`,
      operation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. DELIVERIES: Outgoing stock decreases inventory
router.post('/deliveries', protect, async (req, res) => {
  try {
    const { sourceWarehouseId, customerName, reference, notes, items } = req.body;

    if (!sourceWarehouseId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Source warehouse and items are required' });
    }

    const warehouse = await Warehouse.findById(sourceWarehouseId);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Source warehouse not found' });
    }

    // Verify stock availability
    for (const item of items) {
      const stock = await Stock.findOne({ product: item.productId, warehouse: warehouse._id });
      const available = stock ? stock.quantity : 0;
      if (available < Number(item.quantity)) {
        const prod = await Product.findById(item.productId);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${prod?.name || 'Product'}'. Available in ${warehouse.name}: ${available}, Requested: ${item.quantity}`,
        });
      }
    }

    const opCode = generateOpCode('DEL');
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      const qty = Number(item.quantity);

      const stock = await Stock.findOne({ product: product._id, warehouse: warehouse._id });
      stock.quantity -= qty;
      await stock.save();

      const allStocks = await Stock.find({ product: product._id });
      const totalSystemStock = allStocks.reduce((sum, s) => sum + s.quantity, 0);

      // Ledger entry
      await StockLedger.create({
        transactionType: 'DELIVERY',
        product: product._id,
        warehouse: warehouse._id,
        deltaQuantity: -qty,
        balanceAfter: stock.quantity,
        totalSystemBalanceAfter: totalSystemStock,
        unitCost: product.purchasePrice,
        reference: opCode,
        performedBy: req.user._id,
        notes: `Delivery to ${customerName || 'Customer'} - Ref: ${reference || 'N/A'}`,
      });

      processedItems.push({
        product: product._id,
        quantity: qty,
        unitPrice: product.sellingPrice,
      });

      // Check if low stock triggered
      if (totalSystemStock <= product.minStockLevel) {
        await Notification.create({
          title: `Low Stock Alert: ${product.name}`,
          message: `Total stock dropped to ${totalSystemStock} (Reorder level is ${product.minStockLevel})`,
          type: 'low_stock',
          targetRole: 'manager',
          link: `/smart-insights`,
        });
      }
    }

    const operation = await InventoryOperation.create({
      operationNumber: opCode,
      type: 'delivery',
      status: 'completed',
      sourceWarehouse: warehouse._id,
      items: processedItems,
      partnerName: customerName || 'Direct Customer',
      reference: reference || '',
      notes: notes || '',
      performedBy: req.user._id,
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Delivery ${opCode} completed and stock deducted`,
      operation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. INTERNAL TRANSFERS: Move stock between warehouses without changing total stock
router.post('/transfers', protect, async (req, res) => {
  try {
    const { sourceWarehouseId, destinationWarehouseId, notes, items } = req.body;

    if (!sourceWarehouseId || !destinationWarehouseId) {
      return res.status(400).json({ success: false, message: 'Source and destination warehouses are required' });
    }
    if (sourceWarehouseId === destinationWarehouseId) {
      return res.status(400).json({ success: false, message: 'Source and destination warehouses cannot be the same' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'At least one item is required for transfer' });
    }

    const srcWh = await Warehouse.findById(sourceWarehouseId);
    const destWh = await Warehouse.findById(destinationWarehouseId);
    if (!srcWh || !destWh) {
      return res.status(404).json({ success: false, message: 'One or both warehouses not found' });
    }

    // Verify stock at source
    for (const item of items) {
      const stock = await Stock.findOne({ product: item.productId, warehouse: srcWh._id });
      const available = stock ? stock.quantity : 0;
      if (available < Number(item.quantity)) {
        const prod = await Product.findById(item.productId);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock of '${prod?.name || 'Item'}' at ${srcWh.name}. Available: ${available}, Requested: ${item.quantity}`,
        });
      }
    }

    const opCode = generateOpCode('TRF');
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      const qty = Number(item.quantity);

      // 1. Decrement source warehouse
      const srcStock = await Stock.findOne({ product: product._id, warehouse: srcWh._id });
      srcStock.quantity -= qty;
      await srcStock.save();

      // 2. Increment destination warehouse
      let destStock = await Stock.findOne({ product: product._id, warehouse: destWh._id });
      if (!destStock) {
        destStock = new Stock({ product: product._id, warehouse: destWh._id, quantity: 0 });
      }
      destStock.quantity += qty;
      await destStock.save();

      // Total company stock remains exactly unchanged!
      const allStocks = await Stock.find({ product: product._id });
      const totalSystemStock = allStocks.reduce((sum, s) => sum + s.quantity, 0);

      // Ledger: Transfer Out
      await StockLedger.create({
        transactionType: 'TRANSFER_OUT',
        product: product._id,
        warehouse: srcWh._id,
        deltaQuantity: -qty,
        balanceAfter: srcStock.quantity,
        totalSystemBalanceAfter: totalSystemStock,
        unitCost: product.purchasePrice,
        reference: opCode,
        performedBy: req.user._id,
        notes: `Transfer OUT to ${destWh.name} (${destWh.code})`,
      });

      // Ledger: Transfer In
      await StockLedger.create({
        transactionType: 'TRANSFER_IN',
        product: product._id,
        warehouse: destWh._id,
        deltaQuantity: qty,
        balanceAfter: destStock.quantity,
        totalSystemBalanceAfter: totalSystemStock,
        unitCost: product.purchasePrice,
        reference: opCode,
        performedBy: req.user._id,
        notes: `Transfer IN from ${srcWh.name} (${srcWh.code})`,
      });

      processedItems.push({
        product: product._id,
        quantity: qty,
        unitPrice: product.purchasePrice,
      });
    }

    const operation = await InventoryOperation.create({
      operationNumber: opCode,
      type: 'transfer',
      status: 'completed',
      sourceWarehouse: srcWh._id,
      destinationWarehouse: destWh._id,
      items: processedItems,
      reference: `TRF ${srcWh.code} -> ${destWh.code}`,
      notes: notes || '',
      performedBy: req.user._id,
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Internal Transfer ${opCode} completed: ${processedItems.length} items moved from ${srcWh.name} to ${destWh.name}`,
      operation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. STOCK ADJUSTMENTS: Update physical-count differences
router.post('/adjustments', protect, async (req, res) => {
  try {
    const { warehouseId, reason, notes, items } = req.body;

    if (!warehouseId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Warehouse and item count entries are required' });
    }

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const opCode = generateOpCode('ADJ');
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      let stock = await Stock.findOne({ product: product._id, warehouse: warehouse._id });
      const currentSystemQty = stock ? stock.quantity : 0;
      const physicalCountedQty = Math.max(0, Number(item.countedQuantity));
      const difference = physicalCountedQty - currentSystemQty;

      if (!stock) {
        stock = new Stock({ product: product._id, warehouse: warehouse._id, quantity: physicalCountedQty });
      } else {
        stock.quantity = physicalCountedQty;
      }
      await stock.save();

      const allStocks = await Stock.find({ product: product._id });
      const totalSystemStock = allStocks.reduce((sum, s) => sum + s.quantity, 0);

      if (difference !== 0) {
        await StockLedger.create({
          transactionType: difference > 0 ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_SUB',
          product: product._id,
          warehouse: warehouse._id,
          deltaQuantity: difference,
          balanceAfter: physicalCountedQty,
          totalSystemBalanceAfter: totalSystemStock,
          unitCost: product.purchasePrice,
          reference: opCode,
          performedBy: req.user._id,
          notes: `Stock count adjustment (${reason || 'Physical Count Audit'}). System was: ${currentSystemQty}, Counted: ${physicalCountedQty}`,
        });
      }

      processedItems.push({
        product: product._id,
        quantity: Math.abs(difference) || physicalCountedQty,
        systemQuantity: currentSystemQty,
        countedQuantity: physicalCountedQty,
        difference: difference,
        unitPrice: product.purchasePrice,
      });
    }

    const operation = await InventoryOperation.create({
      operationNumber: opCode,
      type: 'adjustment',
      status: 'completed',
      sourceWarehouse: warehouse._id,
      items: processedItems,
      reason: reason || 'Physical Cycle Count',
      notes: notes || '',
      performedBy: req.user._id,
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Stock Adjustment ${opCode} successfully recorded`,
      operation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 5. STOCK LEDGER: Complete audit history
router.get('/ledger', protect, async (req, res) => {
  try {
    const { productId, warehouseId, transactionType, limit = 50, page = 1 } = req.query;

    let filter = {};
    if (productId && productId !== 'all') {
      filter.product = productId;
    }
    if (warehouseId && warehouseId !== 'all') {
      filter.warehouse = warehouseId;
    }
    if (transactionType && transactionType !== 'all') {
      filter.transactionType = transactionType;
    }

    const total = await StockLedger.countDocuments(filter);
    const ledger = await StockLedger.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('product', 'name sku category unit')
      .populate('warehouse', 'name code')
      .populate('performedBy', 'name role');

    return res.json({
      success: true,
      total,
      ledger,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
