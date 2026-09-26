const mongoose = require('mongoose');
const User = require('../models/User');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Order = require('../models/Order');
const InventoryOperation = require('../models/InventoryOperation');
const StockLedger = require('../models/StockLedger');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Checking if seed is required...');
    const existingUsers = await User.countDocuments();
    const existingProducts = await Product.countDocuments();
    if (existingUsers > 0 && existingProducts > 0) {
      console.log('[Seed] Database already seeded. Skipping initial seeding.');
      return;
    }
    if (existingUsers > 0 && existingProducts === 0) {
      console.log('[Seed] Cleaning up partial seed before reseeding...');
      await User.deleteMany({});
      await Warehouse.deleteMany({});
      await Product.deleteMany({});
      await Stock.deleteMany({});
      await Order.deleteMany({});
      await InventoryOperation.deleteMany({});
      await StockLedger.deleteMany({});
      await Notification.deleteMany({});
    }

    console.log('[Seed] Starting complete database seeding for StockSense Furniture...');

    // 1. Create Users
    const manager = await User.create({
      name: 'Vikramjit Singh',
      email: 'manager@stocksense.com',
      password: 'admin123',
      role: 'manager',
      phone: '+91 98140 12345',
    });

    const staff = await User.create({
      name: 'Harpreet Singh',
      email: 'staff@stocksense.com',
      password: 'staff123',
      role: 'staff',
      phone: '+91 98765 67890',
    });

    console.log('[Seed] Users created: Manager & Warehouse Staff');

    // 2. Create Warehouses
    const wh1 = await Warehouse.create({
      name: 'Main Distribution Hub - Jalandhar',
      code: 'WH-JAL-01',
      address: 'Plot 42, Focal Point Industrial Area',
      city: 'Jalandhar',
      capacity: 8000,
      isDefault: true,
      managerContact: '+91 98140 12345',
    });

    const wh2 = await Warehouse.create({
      name: 'Model Town Showroom Depot',
      code: 'WH-JAL-02',
      address: 'SCO 15-18, Model Town Market',
      city: 'Jalandhar',
      capacity: 2500,
      isDefault: false,
      managerContact: '+91 98765 67890',
    });

    const wh3 = await Warehouse.create({
      name: 'North Regional Logistics Bay',
      code: 'WH-ASR-01',
      address: 'Grand Trunk Road, Rayya Bypass',
      city: 'Amritsar',
      capacity: 6000,
      isDefault: false,
      managerContact: '+91 98150 99887',
    });

    console.log('[Seed] Warehouses created (3 locations)');

    // 3. Create Furniture Products
    const productsData = [
      {
        name: 'Chesterfield 3-Seater Velvet Sofa',
        sku: 'FURN-SOF-001',
        category: 'Living Room',
        unit: 'pcs',
        purchasePrice: 28000,
        sellingPrice: 46500,
        minStockLevel: 8,
        maxStockLevel: 40,
        leadTimeDays: 10,
        material: 'Premium Velvet & Kiln-dried Teak',
        dimensions: '88"W x 38"D x 34"H',
        color: 'Deep Royal Navy',
        description: 'Classic button-tufted Chesterfield sofa with handcrafted scroll arms and plush velvet.',
      },
      {
        name: 'Nordic Solid Oak Coffee Table',
        sku: 'FURN-COF-002',
        category: 'Living Room',
        unit: 'pcs',
        purchasePrice: 5500,
        sellingPrice: 11200,
        minStockLevel: 12,
        maxStockLevel: 60,
        leadTimeDays: 7,
        material: 'Solid White Oak & Natural Wax',
        dimensions: '48"L x 24"W x 18"H',
        color: 'Natural White Oak',
        description: 'Clean Scandinavian silhouette with softened curved edges and dual lower storage shelf.',
      },
      {
        name: 'Ergonomic Top-Grain Leather Recliner',
        sku: 'FURN-REC-003',
        category: 'Living Room',
        unit: 'pcs',
        purchasePrice: 18500,
        sellingPrice: 32000,
        minStockLevel: 6,
        maxStockLevel: 30,
        leadTimeDays: 12,
        material: 'Italian Top-Grain Leather & Steel Frame',
        dimensions: '34"W x 36"D x 42"H',
        color: 'Cognac Brown',
        description: 'Motorized dual-pivot reclining mechanism with 360-degree silent swivel base.',
      },
      {
        name: 'Royal Sheesham 6-Seater Dining Set',
        sku: 'FURN-DIN-004',
        category: 'Dining Room',
        unit: 'set',
        purchasePrice: 34000,
        sellingPrice: 58000,
        minStockLevel: 5,
        maxStockLevel: 25,
        leadTimeDays: 14,
        material: 'Seasoned Indian Rosewood (Sheesham)',
        dimensions: '72"L x 36"W x 30"H',
        color: 'Warm Honey Teak',
        description: 'Handcrafted heirloom dining table with 6 cushioned high-back chairs.',
      },
      {
        name: 'Mid-Century Dining Chairs (Set of 2)',
        sku: 'FURN-DCH-005',
        category: 'Dining Room',
        unit: 'pair',
        purchasePrice: 4200,
        sellingPrice: 8900,
        minStockLevel: 15,
        maxStockLevel: 80,
        leadTimeDays: 5,
        material: 'Walnut Finish Hardwood & Linen Fabric',
        dimensions: '20"W x 22"D x 32"H',
        color: 'Oatmeal Beige',
        description: 'Tapered legs and curved supportive backrest for ergonomic dinner seating.',
      },
      {
        name: 'Minimalist Teak Wood Sideboard Buffet',
        sku: 'FURN-SBD-006',
        category: 'Dining Room',
        unit: 'pcs',
        purchasePrice: 14000,
        sellingPrice: 26500,
        minStockLevel: 5,
        maxStockLevel: 30,
        leadTimeDays: 9,
        material: 'Grade-A Reclaimed Teak & Brass Hardware',
        dimensions: '60"W x 18"D x 32"H',
        color: 'Aged Teak',
        description: 'Three soft-close cabinet doors with internal adjustable shelving for dinnerware.',
      },
      {
        name: 'Aura King Size Storage Bed - Walnut',
        sku: 'FURN-BED-007',
        category: 'Bedroom',
        unit: 'pcs',
        purchasePrice: 26000,
        sellingPrice: 44000,
        minStockLevel: 6,
        maxStockLevel: 35,
        leadTimeDays: 10,
        material: 'Engineered Walnut Veneer & Hydraulic Lift',
        dimensions: '78"W x 84"L x 48"H',
        color: 'Rich Walnut',
        description: 'Hydraulic easy-lift platform reveals massive under-bed organized storage compartment.',
      },
      {
        name: 'Ortho-Comfort 8-Inch Memory Foam Mattress',
        sku: 'FURN-MAT-008',
        category: 'Bedroom',
        unit: 'pcs',
        purchasePrice: 11000,
        sellingPrice: 21500,
        minStockLevel: 10,
        maxStockLevel: 50,
        leadTimeDays: 6,
        material: 'High-Density Gel Memory Foam & Bamboo Cover',
        dimensions: '72"W x 78"L x 8"H',
        color: 'Bamboo White & Slate Border',
        description: 'Orthopedic 3-zone spinal support with cooling gel-infused top comfort layer.',
      },
      {
        name: 'Minimalist 2-Drawer Floating Nightstand',
        sku: 'FURN-NST-009',
        category: 'Bedroom',
        unit: 'pcs',
        purchasePrice: 2400,
        sellingPrice: 5800,
        minStockLevel: 15,
        maxStockLevel: 70,
        leadTimeDays: 4,
        material: 'MDF & Natural Oak Veneer',
        dimensions: '18"W x 14"D x 10"H',
        color: 'Natural Oak',
        description: 'Wall-mounted nightstand creating an open, airy bedroom aesthetic.',
      },
      {
        name: 'Apex Dual-Motor Electric Standing Desk',
        sku: 'FURN-DSK-010',
        category: 'Office',
        unit: 'pcs',
        purchasePrice: 19000,
        sellingPrice: 34500,
        minStockLevel: 8,
        maxStockLevel: 45,
        leadTimeDays: 8,
        material: 'Heavy-Duty Steel & Seamless Walnut Top',
        dimensions: '55"W x 28"D x 28"-48"H',
        color: 'Matte Black Legs / Walnut Top',
        description: 'Whisper-quiet dual motors with 4 programmable memory height presets.',
      },
      {
        name: 'Pro-Mesh Ergonomic Executive Chair',
        sku: 'FURN-CHR-011',
        category: 'Office',
        unit: 'pcs',
        purchasePrice: 8500,
        sellingPrice: 16900,
        minStockLevel: 14,
        maxStockLevel: 75,
        leadTimeDays: 5,
        material: 'Breathable Korean Mesh & Aluminum Alloy',
        dimensions: '26"W x 26"D x 46"-50"H',
        color: 'Carbon Black',
        description: 'Self-adjusting dynamic lumbar support, 4D adjustable armrests, and 135° recline.',
      },
      {
        name: 'Industrial 5-Tier Steel & Oak Bookcase',
        sku: 'FURN-BCK-012',
        category: 'Storage',
        unit: 'pcs',
        purchasePrice: 6800,
        sellingPrice: 13500,
        minStockLevel: 10,
        maxStockLevel: 40,
        leadTimeDays: 7,
        material: 'Powder-coated Carbon Steel & Oak Planks',
        dimensions: '40"W x 14"D x 72"H',
        color: 'Industrial Black & Weathered Oak',
        description: 'Heavy duty open architectural display shelf suitable for home offices and living rooms.',
      },
      {
        name: 'Milano 4-Door Modern Wardrobe',
        sku: 'FURN-WRD-013',
        category: 'Storage',
        unit: 'pcs',
        purchasePrice: 22000,
        sellingPrice: 39000,
        minStockLevel: 5,
        maxStockLevel: 25,
        leadTimeDays: 14,
        material: 'Moisture-Resistant HDF & Mirror Accent',
        dimensions: '72"W x 22"D x 84"H',
        color: 'Smoky Grey & Matte Anthracite',
        description: 'Spacious wardrobe with integrated LED lighting strip and soft-close hinges.',
      },
      {
        name: 'Riviera Weatherproof Rattan Patio Lounge Set',
        sku: 'FURN-PAT-014',
        category: 'Outdoor',
        unit: 'set',
        purchasePrice: 29000,
        sellingPrice: 52000,
        minStockLevel: 4,
        maxStockLevel: 20,
        leadTimeDays: 15,
        material: 'UV-Resistant PE Rattan & Sunbrella Fabric',
        dimensions: 'L-Shape 84" x 84"',
        color: 'Earthy Sand & Ash Grey',
        description: 'All-weather modular outdoor sectional sofa with glass-topped coffee table.',
      },
      {
        name: 'Handcrafted Teak Garden Park Bench',
        sku: 'FURN-BEN-015',
        category: 'Outdoor',
        unit: 'pcs',
        purchasePrice: 7500,
        sellingPrice: 14800,
        minStockLevel: 6,
        maxStockLevel: 30,
        leadTimeDays: 9,
        material: 'High-Oil Plantation Teak',
        dimensions: '60"L x 24"D x 36"H',
        color: 'Golden Teak',
        description: 'Traditional slatted garden park bench with weather-resistant natural timber oils.',
      },
    ];

    const products = [];
    for (const p of productsData) {
      const prod = await Product.create(p);
      products.push(prod);
    }
    console.log(`[Seed] Products created (${products.length} catalog items)`);

    // 4. Distribute stock across the 3 warehouses
    // Let's create varying quantities:
    // some normal, some low stock (e.g. FURN-SOF-001, FURN-DIN-004), some out of stock (FURN-PAT-014) to showcase smart alerts!
    const stockDistribution = [
      { prodIdx: 0, wh1: 3, wh2: 2, wh3: 1 }, // Total 6 <= minStock 8 (LOW STOCK)
      { prodIdx: 1, wh1: 22, wh2: 10, wh3: 8 }, // Total 40 (HEALTHY)
      { prodIdx: 2, wh1: 12, wh2: 5, wh3: 4 }, // Total 21 (HEALTHY)
      { prodIdx: 3, wh1: 2, wh2: 1, wh3: 0 }, // Total 3 <= minStock 5 (LOW STOCK)
      { prodIdx: 4, wh1: 35, wh2: 15, wh3: 12 }, // Total 62 (HEALTHY)
      { prodIdx: 5, wh1: 8, wh2: 4, wh3: 2 }, // Total 14 (HEALTHY)
      { prodIdx: 6, wh1: 14, wh2: 6, wh3: 5 }, // Total 25 (HEALTHY)
      { prodIdx: 7, wh1: 18, wh2: 8, wh3: 6 }, // Total 32 (HEALTHY)
      { prodIdx: 8, wh1: 28, wh2: 12, wh3: 10 }, // Total 50 (HEALTHY)
      { prodIdx: 9, wh1: 4, wh2: 2, wh3: 1 }, // Total 7 <= minStock 8 (LOW STOCK)
      { prodIdx: 10, wh1: 42, wh2: 18, wh3: 15 }, // Total 75 (BEST SELLER)
      { prodIdx: 11, wh1: 16, wh2: 8, wh3: 6 }, // Total 30 (HEALTHY)
      { prodIdx: 12, wh1: 7, wh2: 3, wh3: 2 }, // Total 12 (HEALTHY)
      { prodIdx: 13, wh1: 0, wh2: 0, wh3: 0 }, // Total 0 (OUT OF STOCK - CRITICAL)
      { prodIdx: 14, wh1: 15, wh2: 5, wh3: 4 }, // Total 24 (DEAD STOCK candidate)
    ];

    for (const dist of stockDistribution) {
      const prod = products[dist.prodIdx];
      await Stock.create({ product: prod._id, warehouse: wh1._id, quantity: dist.wh1, aisleLocation: 'A-01-01' });
      await Stock.create({ product: prod._id, warehouse: wh2._id, quantity: dist.wh2, aisleLocation: 'B-02-04' });
      await Stock.create({ product: prod._id, warehouse: wh3._id, quantity: dist.wh3, aisleLocation: 'C-01-12' });

      const total = dist.wh1 + dist.wh2 + dist.wh3;
      await StockLedger.create({
        transactionType: 'INITIAL_STOCK',
        product: prod._id,
        warehouse: wh1._id,
        deltaQuantity: total,
        balanceAfter: dist.wh1,
        totalSystemBalanceAfter: total,
        unitCost: prod.purchasePrice,
        reference: 'INIT-INVENTORY',
        performedBy: manager._id,
        notes: 'Initial warehouse allocation at system setup',
      });
    }

    console.log('[Seed] Stock balances and initial ledgers established');

    // 5. Create Realistic Customer Orders across the past 5 months
    const customers = [
      { name: 'Simranjit Kaur', email: 'simran.kaur@gmail.com', phone: '+91 98141 22334', city: 'Jalandhar', address: '124 Urban Estate Phase 2' },
      { name: 'Rajesh Sharma', email: 'rajesh.sharma@hotmail.com', phone: '+91 98881 55667', city: 'Ludhiana', address: '45-B Sarabha Nagar' },
      { name: 'Amitabh Verma', email: 'amitabh.v@outlook.com', phone: '+91 99150 77889', city: 'Chandigarh', address: 'Sector 8-C' },
      { name: 'Gurpreet Chawla', email: 'gurpreet.chawla@yahoo.com', phone: '+91 98722 33445', city: 'Amritsar', address: 'Court Road Civil Lines' },
      { name: 'Neha Khanna', email: 'neha.khanna@gmail.com', phone: '+91 98155 44332', city: 'Jalandhar', address: 'Model Town Ext.' },
      { name: 'Davinder Pal', email: 'dpal.contractor@gmail.com', phone: '+91 98142 88990', city: 'Phagwara', address: 'GT Road Commercial Plaza' },
      { name: 'Pooja Malhotra', email: 'pooja.m@gmail.com', phone: '+91 98889 11223', city: 'Jalandhar', address: 'Defence Colony' },
    ];

    const orderStatuses = ['delivered', 'delivered', 'delivered', 'delivered', 'ready', 'confirmed', 'pending'];
    const now = new Date();

    // Create 24 realistic orders distributed over past 5 months
    let orderIndex = 1;
    for (let monthOffset = 4; monthOffset >= 0; monthOffset--) {
      const ordersInMonth = monthOffset === 0 ? 6 : 4; // current month has 6 orders

      for (let o = 0; o < ordersInMonth; o++) {
        const cust = customers[(orderIndex + o) % customers.length];
        const status = monthOffset > 0 ? 'delivered' : orderStatuses[o % orderStatuses.length];

        // Random date in that month
        const orderDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.min(25, 3 + o * 4), 11, 30);

        // Pick 1-3 products
        const p1 = products[(orderIndex * 2) % products.length];
        const p2 = products[(orderIndex * 3 + 1) % products.length];
        const qty1 = 1 + (o % 2);
        const qty2 = 1;

        const subtotal1 = p1.sellingPrice * qty1;
        const profit1 = (p1.sellingPrice - p1.purchasePrice) * qty1;

        const items = [
          {
            product: p1._id,
            quantity: qty1,
            purchasePrice: p1.purchasePrice,
            sellingPrice: p1.sellingPrice,
            subtotal: subtotal1,
            profit: profit1,
          },
        ];

        let totalAmt = subtotal1;
        let totalCost = p1.purchasePrice * qty1;
        let totalProfit = profit1;

        if (o % 2 === 1) {
          const subtotal2 = p2.sellingPrice * qty2;
          const profit2 = (p2.sellingPrice - p2.purchasePrice) * qty2;
          items.push({
            product: p2._id,
            quantity: qty2,
            purchasePrice: p2.purchasePrice,
            sellingPrice: p2.sellingPrice,
            subtotal: subtotal2,
            profit: profit2,
          });
          totalAmt += subtotal2;
          totalCost += p2.purchasePrice * qty2;
          totalProfit += profit2;
        }

        const dateStr = orderDate.toISOString().slice(2, 7).replace('-', '');
        const orderNum = `SO-${dateStr}-${1000 + orderIndex}`;

        await Order.create({
          orderNumber: orderNum,
          customer: cust,
          items,
          totalAmount: totalAmt,
          totalCost: totalCost,
          totalProfit: totalProfit,
          status,
          fulfillmentWarehouse: o % 3 === 0 ? wh2._id : wh1._id,
          notes: `Customer Order for ${cust.name}`,
          createdBy: manager._id,
          createdAt: orderDate,
          deliveredAt: status === 'delivered' ? orderDate : null,
        });

        // Add ledger record if delivered
        if (status === 'delivered') {
          for (const item of items) {
            await StockLedger.create({
              transactionType: 'ORDER_FULFILLMENT',
              product: item.product,
              warehouse: wh1._id,
              deltaQuantity: -item.quantity,
              balanceAfter: 20,
              totalSystemBalanceAfter: 35,
              unitCost: item.purchasePrice,
              reference: orderNum,
              performedBy: staff._id,
              notes: `Order fulfillment for ${cust.name}`,
              createdAt: orderDate,
            });
          }
        }

        orderIndex++;
      }
    }

    console.log(`[Seed] Historical customer orders created (${orderIndex - 1} orders)`);

    // 6. Create Realistic Inventory Operations (Receipts, Deliveries, Transfers, Adjustments)
    // Receipt 1
    await InventoryOperation.create({
      operationNumber: 'REC-2026-001',
      type: 'receipt',
      status: 'completed',
      destinationWarehouse: wh1._id,
      items: [
        { product: products[1]._id, quantity: 15, unitPrice: products[1].purchasePrice },
        { product: products[10]._id, quantity: 20, unitPrice: products[10].purchasePrice },
      ],
      partnerName: 'Punjab Teak & Timberline Exports',
      reference: 'PO-77821',
      notes: 'Quarterly shipment of oak lumber tables & office mesh chairs',
      performedBy: staff._id,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    // Transfer 1
    await InventoryOperation.create({
      operationNumber: 'TRF-2026-002',
      type: 'transfer',
      status: 'completed',
      sourceWarehouse: wh1._id,
      destinationWarehouse: wh2._id,
      items: [
        { product: products[0]._id, quantity: 2, unitPrice: products[0].purchasePrice },
        { product: products[6]._id, quantity: 3, unitPrice: products[6].purchasePrice },
      ],
      reference: 'TRF WH-JAL-01 -> WH-JAL-02',
      notes: 'Replenishing Model Town showroom display models',
      performedBy: staff._id,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Adjustment 1
    await InventoryOperation.create({
      operationNumber: 'ADJ-2026-003',
      type: 'adjustment',
      status: 'completed',
      sourceWarehouse: wh1._id,
      items: [
        {
          product: products[2]._id,
          quantity: 1,
          systemQuantity: 13,
          countedQuantity: 12,
          difference: -1,
          unitPrice: products[2].purchasePrice,
        },
      ],
      reason: 'Transit surface scratch detected during physical audit',
      notes: 'Moved damaged piece to refurbishment bay',
      performedBy: staff._id,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // 7. Initial Notifications
    await Notification.create({
      title: 'CRITICAL: Patio Lounge Set Out of Stock',
      message: 'Riviera Weatherproof Rattan Patio Sofa Set has 0 units across all warehouses. Reorder suggested.',
      type: 'low_stock',
      targetRole: 'manager',
      link: '/smart-insights',
    });

    await Notification.create({
      title: 'Low Stock Alert: Chesterfield Sofa',
      message: 'Stock is down to 6 units (reorder threshold is 8). 10-day lead time required.',
      type: 'low_stock',
      targetRole: 'manager',
      link: '/smart-insights',
    });

    await Notification.create({
      title: 'New Purchase Order Received: SO-2609-1024',
      message: 'Order received from Simranjit Kaur for ₹46,500. Awaiting manager confirmation.',
      type: 'order',
      targetRole: 'manager',
      link: '/orders',
    });

    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Error during database seed:', error);
  }
};

module.exports = seedDatabase;
