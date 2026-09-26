const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Order = require('../models/Order');
const InventoryOperation = require('../models/InventoryOperation');
const StockLedger = require('../models/StockLedger');
const { protect } = require('../middleware/auth');

// 1. DASHBOARD OVERVIEW STATS
router.get('/dashboard', protect, async (req, res) => {
  try {
    // 1. Stock counts
    const products = await Product.find({ isActive: true });
    const stocks = await Stock.find();

    // Map total stock per product
    const productStockMap = {};
    stocks.forEach((s) => {
      const pid = s.product.toString();
      productStockMap[pid] = (productStockMap[pid] || 0) + s.quantity;
    });

    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const qty = productStockMap[p._id.toString()] || 0;
      totalStockUnits += qty;
      if (qty === 0) {
        outOfStockCount++;
      } else if (qty <= p.minStockLevel) {
        lowStockCount++;
      }
    });

    // 2. Pending operations
    const pendingReceipts = await InventoryOperation.countDocuments({ type: 'receipt', status: { $in: ['pending', 'draft'] } });
    const pendingDeliveries = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'ready'] } });

    // 3. Current month vs Previous month sales & profit
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const currentMonthOrders = await Order.find({
      status: { $in: ['confirmed', 'ready', 'delivered'] },
      createdAt: { $gte: currentMonthStart },
    });

    const prevMonthOrders = await Order.find({
      status: { $in: ['confirmed', 'ready', 'delivered'] },
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });

    const currentMonthSales = currentMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const currentMonthProfit = currentMonthOrders.reduce((sum, o) => sum + o.totalProfit, 0);

    const prevMonthSales = prevMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const prevMonthProfit = prevMonthOrders.reduce((sum, o) => sum + o.totalProfit, 0);

    let monthlyGrowthPercent = 0;
    if (prevMonthSales > 0) {
      monthlyGrowthPercent = Number((((currentMonthSales - prevMonthSales) / prevMonthSales) * 100).toFixed(1));
    } else if (currentMonthSales > 0) {
      monthlyGrowthPercent = 100;
    }

    // 4. Recent activities (recent operations and orders)
    const recentOperations = await InventoryOperation.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('performedBy', 'name')
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code');

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('fulfillmentWarehouse', 'name');

    // 5. Monthly trend for chart (past 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const mName = mStart.toLocaleString('default', { month: 'short' });

      const mOrders = await Order.find({
        status: { $in: ['confirmed', 'ready', 'delivered'] },
        createdAt: { $gte: mStart, $lte: mEnd },
      });

      const mSales = mOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const mProfit = mOrders.reduce((sum, o) => sum + o.totalProfit, 0);
      const mCost = mSales - mProfit;

      monthlyTrend.push({
        month: mName,
        year: mStart.getFullYear(),
        sales: mSales,
        profit: mProfit,
        cost: mCost,
        ordersCount: mOrders.length,
      });
    }

    return res.json({
      success: true,
      stats: {
        totalStock: totalStockUnits,
        totalSkus: products.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        currentMonthSales,
        currentMonthProfit,
        prevMonthSales,
        prevMonthProfit,
        monthlyGrowthPercent,
      },
      monthlyTrend,
      recentOperations,
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. SALES ANALYTICS
router.get('/sales', protect, async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'cancelled' } }).populate('items.product');

    // Group sales product-wise
    const productSalesMap = {};
    const categorySalesMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.product) return;
        const pid = item.product._id.toString();
        const cat = item.product.category || 'General';

        // Product stats
        if (!productSalesMap[pid]) {
          productSalesMap[pid] = {
            id: pid,
            name: item.product.name,
            sku: item.product.sku,
            category: item.product.category,
            unitsSold: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productSalesMap[pid].unitsSold += item.quantity;
        productSalesMap[pid].revenue += item.subtotal;
        productSalesMap[pid].profit += item.profit;

        // Category stats
        if (!categorySalesMap[cat]) {
          categorySalesMap[cat] = { category: cat, revenue: 0, units: 0 };
        }
        categorySalesMap[cat].revenue += item.subtotal;
        categorySalesMap[cat].units += item.quantity;
      });
    });

    const productSalesArray = Object.values(productSalesMap);

    // Best-selling products (by revenue and volume)
    const bestSelling = [...productSalesArray].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Slow-moving products (low units sold, or zero sales)
    const allProducts = await Product.find({ isActive: true });
    const allStocks = await Stock.find();

    const stockMap = {};
    allStocks.forEach((s) => {
      const pid = s.product.toString();
      stockMap[pid] = (stockMap[pid] || 0) + s.quantity;
    });

    const fullProductSales = allProducts.map((p) => {
      const record = productSalesMap[p._id.toString()] || {
        id: p._id.toString(),
        name: p.name,
        sku: p.sku,
        category: p.category,
        unitsSold: 0,
        revenue: 0,
        profit: 0,
      };
      return {
        ...record,
        currentStock: stockMap[p._id.toString()] || 0,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
      };
    });

    const slowMoving = fullProductSales
      .filter((p) => p.currentStock > 0)
      .sort((a, b) => a.unitsSold - b.unitsSold)
      .slice(0, 10);

    // Past 12 months history
    const now = new Date();
    const monthlyHistory = [];
    for (let i = 11; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const mOrders = orders.filter((o) => o.createdAt >= mStart && o.createdAt <= mEnd);
      const rev = mOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const prof = mOrders.reduce((sum, o) => sum + o.totalProfit, 0);

      monthlyHistory.push({
        month: mStart.toLocaleString('default', { month: 'short' }),
        year: mStart.getFullYear(),
        revenue: rev,
        profit: prof,
        orders: mOrders.length,
      });
    }

    // Current month vs previous month growth calculation
    const currMonthRev = monthlyHistory[11]?.revenue || 0;
    const prevMonthRev = monthlyHistory[10]?.revenue || 0;
    const growthPercent = prevMonthRev > 0 ? Number((((currMonthRev - prevMonthRev) / prevMonthRev) * 100).toFixed(1)) : 0;

    return res.json({
      success: true,
      currentMonthRevenue: currMonthRev,
      previousMonthRevenue: prevMonthRev,
      growthPercent,
      bestSelling,
      slowMoving,
      categoryDistribution: Object.values(categorySalesMap),
      monthlyHistory,
      allProductSales: fullProductSales,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. PROFIT ANALYTICS
router.get('/profit', protect, async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['confirmed', 'ready', 'delivered'] } }).populate('items.product');

    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalProfit = 0;

    const productProfitMap = {};

    orders.forEach((o) => {
      totalRevenue += o.totalAmount;
      totalCOGS += o.totalCost;
      totalProfit += o.totalProfit;

      o.items.forEach((item) => {
        if (!item.product) return;
        const pid = item.product._id.toString();
        if (!productProfitMap[pid]) {
          productProfitMap[pid] = {
            id: pid,
            name: item.product.name,
            sku: item.product.sku,
            category: item.product.category,
            unitsSold: 0,
            revenue: 0,
            cogs: 0,
            profit: 0,
          };
        }
        const itemRev = item.subtotal;
        const itemCogs = item.purchasePrice * item.quantity;
        const itemProf = itemRev - itemCogs;

        productProfitMap[pid].unitsSold += item.quantity;
        productProfitMap[pid].revenue += itemRev;
        productProfitMap[pid].cogs += itemCogs;
        productProfitMap[pid].profit += itemProf;
      });
    });

    const productProfits = Object.values(productProfitMap).map((p) => ({
      ...p,
      marginPercent: p.revenue > 0 ? Number(((p.profit / p.revenue) * 100).toFixed(1)) : 0,
    }));

    productProfits.sort((a, b) => b.profit - a.profit);

    const overallMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // Monthly Profit comparison (Past 6 months)
    const now = new Date();
    const monthlyProfitComparison = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const mOrders = orders.filter((o) => o.createdAt >= mStart && o.createdAt <= mEnd);
      const rev = mOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const cogs = mOrders.reduce((sum, o) => sum + o.totalCost, 0);
      const prof = rev - cogs;
      const margin = rev > 0 ? Number(((prof / rev) * 100).toFixed(1)) : 0;

      monthlyProfitComparison.push({
        month: mStart.toLocaleString('default', { month: 'short' }),
        year: mStart.getFullYear(),
        revenue: rev,
        cogs,
        profit: prof,
        marginPercent: margin,
      });
    }

    return res.json({
      success: true,
      summary: {
        totalRevenue,
        totalCOGS,
        totalProfit,
        overallMargin,
      },
      productProfits,
      monthlyProfitComparison,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. SMART FEATURES: Reorder Suggestions, Dead-Stock Detection, Stockout Prediction
router.get('/smart-insights', protect, async (req, res) => {
  try {
    const { deadStockDays = 60 } = req.query;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - Number(deadStockDays));

    const products = await Product.find({ isActive: true });
    const stocks = await Stock.find().populate('warehouse', 'name code');
    const orders = await Order.find({ status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });

    // Aggregate stock by product
    const productStockMap = {};
    stocks.forEach((s) => {
      const pid = s.product.toString();
      if (!productStockMap[pid]) {
        productStockMap[pid] = { total: 0, byWarehouse: [] };
      }
      productStockMap[pid].total += s.quantity;
      productStockMap[pid].byWarehouse.push({
        warehouseName: s.warehouse?.name,
        quantity: s.quantity,
      });
    });

    // Calculate sales velocity (units sold in past 30 days) and last sale date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesVelocityMap = {};
    const lastSaleDateMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const pid = item.product.toString();
        // Last sale date
        if (!lastSaleDateMap[pid] || new Date(order.createdAt) > new Date(lastSaleDateMap[pid])) {
          lastSaleDateMap[pid] = order.createdAt;
        }

        // 30 days velocity
        if (new Date(order.createdAt) >= thirtyDaysAgo) {
          salesVelocityMap[pid] = (salesVelocityMap[pid] || 0) + item.quantity;
        }
      });
    });

    // 1. Smart Reorder Suggestions
    const reorderSuggestions = [];
    // 2. Dead Stock Items
    const deadStockItems = [];
    // 3. Stockout Risk Forecasts
    const stockoutPredictions = [];

    products.forEach((prod) => {
      const pid = prod._id.toString();
      const currentStock = productStockMap[pid]?.total || 0;
      const unitsPast30Days = salesVelocityMap[pid] || 0;
      const dailySalesRate = unitsPast30Days / 30; // avg units per day
      const leadTime = prod.leadTimeDays || 7;

      // Burn rate & estimated days until stockout
      let daysUntilStockout = null;
      if (dailySalesRate > 0) {
        daysUntilStockout = Math.round(currentStock / dailySalesRate);
      } else if (currentStock === 0) {
        daysUntilStockout = 0;
      }

      // Check if reorder is needed:
      // If currentStock <= minStockLevel OR if current stock won't survive lead time + safety buffer
      const bufferThreshold = Math.ceil(dailySalesRate * leadTime * 1.5) || prod.minStockLevel;
      const isReorderNeeded = currentStock <= Math.max(prod.minStockLevel, bufferThreshold);

      if (isReorderNeeded) {
        // Suggested reorder quantity = target max level - current stock, or at least 2 weeks of sales
        const suggestedQuantity = Math.max(
          prod.maxStockLevel - currentStock,
          Math.ceil(dailySalesRate * 30) || prod.minStockLevel * 2
        );

        reorderSuggestions.push({
          product: prod,
          currentStock,
          minStockLevel: prod.minStockLevel,
          dailySalesRate: Number(dailySalesRate.toFixed(2)),
          leadTimeDays: leadTime,
          daysUntilStockout: daysUntilStockout !== null ? daysUntilStockout : 999,
          suggestedQuantity,
          estimatedCost: suggestedQuantity * prod.purchasePrice,
          priority: currentStock === 0 ? 'CRITICAL' : currentStock <= prod.minStockLevel / 2 ? 'HIGH' : 'MEDIUM',
        });
      }

      // Check Dead Stock:
      // Product has current stock > 0, but no sales in `deadStockDays` or ever
      const lastSale = lastSaleDateMap[pid];
      const isDeadStock = currentStock > 0 && (!lastSale || new Date(lastSale) < thresholdDate);

      if (isDeadStock) {
        const tiedCapital = currentStock * prod.purchasePrice;
        const potentialRevenue = currentStock * prod.sellingPrice;
        const daysSinceLastSale = lastSale
          ? Math.floor((new Date() - new Date(lastSale)) / (1000 * 60 * 60 * 24))
          : 'Never sold';

        deadStockItems.push({
          product: prod,
          currentStock,
          lastSaleDate: lastSale || null,
          daysSinceLastSale,
          tiedCapital,
          potentialRevenue,
          recommendation:
            tiedCapital > 50000
              ? 'Run 25% promotional discount or bundle with fast-moving living room items'
              : 'Discount clearance or transfer to retail showroom floor',
        });
      }

      // Stockout risk forecast (products selling fast that will run out within 14 days)
      if (daysUntilStockout !== null && daysUntilStockout <= 14) {
        stockoutPredictions.push({
          product: prod,
          currentStock,
          dailyBurnRate: Number(dailySalesRate.toFixed(1)),
          daysUntilStockout,
          runoutDate: new Date(Date.now() + daysUntilStockout * 24 * 60 * 60 * 1000),
          riskLevel: daysUntilStockout <= 3 ? 'IMMINENT' : daysUntilStockout <= 7 ? 'HIGH' : 'MODERATE',
        });
      }
    });

    // Sort reorders by priority
    reorderSuggestions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    stockoutPredictions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    deadStockItems.sort((a, b) => b.tiedCapital - a.tiedCapital);

    const totalTiedDeadStockCapital = deadStockItems.reduce((sum, d) => sum + d.tiedCapital, 0);

    return res.json({
      success: true,
      deadStockDaysFilter: Number(deadStockDays),
      reorderSuggestions,
      deadStockItems,
      totalTiedDeadStockCapital,
      stockoutPredictions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
