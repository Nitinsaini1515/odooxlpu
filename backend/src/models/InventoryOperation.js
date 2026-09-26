const mongoose = require('mongoose');

const operationItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    default: 0,
  },
  // Used specifically in stock adjustments
  systemQuantity: {
    type: Number,
    default: 0,
  },
  countedQuantity: {
    type: Number,
    default: 0,
  },
  difference: {
    type: Number,
    default: 0,
  },
});

const inventoryOperationSchema = new mongoose.Schema(
  {
    operationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['receipt', 'delivery', 'transfer', 'adjustment'],
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'pending', 'completed', 'cancelled'],
      default: 'completed',
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    items: [operationItemSchema],
    partnerName: {
      type: String, // Supplier name or Customer name
      default: '',
    },
    reference: {
      type: String, // Invoice #, PO #, Order ref
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    reason: {
      type: String, // Reason for adjustment: 'Damage', 'Cycle Count', 'Theft', 'Expired', 'System Error'
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InventoryOperation', inventoryOperationSchema);
