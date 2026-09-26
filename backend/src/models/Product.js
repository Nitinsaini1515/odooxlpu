const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Living Room', 'Dining Room', 'Bedroom', 'Office', 'Outdoor', 'Storage', 'Decor'],
      default: 'Living Room',
    },
    unit: {
      type: String,
      default: 'pcs',
      enum: ['pcs', 'set', 'box', 'pair'],
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price must be positive'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price must be positive'],
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, 'Min stock level must be positive'],
    },
    maxStockLevel: {
      type: Number,
      default: 100,
    },
    leadTimeDays: {
      type: Number,
      default: 7, // days to restock
      min: 1,
    },
    description: {
      type: String,
      default: '',
    },
    material: {
      type: String,
      default: 'Solid Wood & Upholstery',
    },
    dimensions: {
      type: String,
      default: 'Standard',
    },
    color: {
      type: String,
      default: 'Natural Wood / Charcoal',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for Profit Margin per unit
productSchema.virtual('unitProfit').get(function () {
  return this.sellingPrice - this.purchasePrice;
});

productSchema.virtual('profitMarginPercent').get(function () {
  if (!this.sellingPrice || this.sellingPrice === 0) return 0;
  return Number((((this.sellingPrice - this.purchasePrice) / this.sellingPrice) * 100).toFixed(1));
});

module.exports = mongoose.model('Product', productSchema);
