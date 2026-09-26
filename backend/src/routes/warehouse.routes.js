const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const Stock = require('../models/Stock');
const { protect, restrictTo } = require('../middleware/auth');

// Get all warehouses with total stock counts
router.get('/', protect, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true }).sort({ isDefault: -1, createdAt: 1 });

    const warehousesWithStats = await Promise.all(
      warehouses.map(async (wh) => {
        const stocks = await Stock.find({ warehouse: wh._id });
        const totalUnits = stocks.reduce((sum, s) => sum + s.quantity, 0);
        const distinctSkus = stocks.filter((s) => s.quantity > 0).length;
        const utilization = wh.capacity ? Math.min(100, Math.round((totalUnits / wh.capacity) * 100)) : 0;

        return {
          ...wh.toObject(),
          totalUnits,
          distinctSkus,
          utilization,
        };
      })
    );

    return res.json({ success: true, warehouses: warehousesWithStats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get stock matrix across all warehouses
router.get('/matrix/overview', protect, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true }).select('name code isDefault');
    const stocks = await Stock.find()
      .populate('product', 'name sku category purchasePrice sellingPrice minStockLevel')
      .populate('warehouse', 'name code');

    // Group by product
    const matrix = {};
    stocks.forEach((s) => {
      if (!s.product || !s.warehouse) return;
      const pid = s.product._id.toString();
      if (!matrix[pid]) {
        matrix[pid] = {
          product: s.product,
          warehouseStock: {},
          totalStock: 0,
        };
      }
      matrix[pid].warehouseStock[s.warehouse._id.toString()] = {
        quantity: s.quantity,
        reserved: s.reservedQuantity || 0,
        code: s.warehouse.code,
        name: s.warehouse.name,
      };
      matrix[pid].totalStock += s.quantity;
    });

    return res.json({
      success: true,
      warehouses,
      matrix: Object.values(matrix),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get warehouse by ID with its inventory breakdown
router.get('/:id', protect, async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const stocks = await Stock.find({ warehouse: req.params.id }).populate('product');

    return res.json({
      success: true,
      warehouse,
      stocks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create warehouse (manager only)
router.post('/', protect, restrictTo('manager'), async (req, res) => {
  try {
    const { name, code, address, city, capacity, isDefault, managerContact } = req.body;

    const existing = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Warehouse code already exists' });
    }

    if (isDefault) {
      // Unset previous default
      await Warehouse.updateMany({}, { isDefault: false });
    }

    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      address,
      city,
      capacity: capacity || 5000,
      isDefault: !!isDefault,
      managerContact,
    });

    return res.status(201).json({ success: true, message: 'Warehouse created', warehouse });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update warehouse
router.put('/:id', protect, restrictTo('manager'), async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Warehouse.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    return res.json({ success: true, message: 'Warehouse updated', warehouse });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
