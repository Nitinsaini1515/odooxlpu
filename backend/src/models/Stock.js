const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    aisleLocation: {
      type: String,
      default: 'A-1-01',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available quantity
stockSchema.virtual('availableQuantity').get(function () {
  return Math.max(0, this.quantity - (this.reservedQuantity || 0));
});

// Compound unique index so each product only has one entry per warehouse
stockSchema.index({ product: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);
