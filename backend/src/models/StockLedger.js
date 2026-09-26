const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      required: true,
      enum: [
        'RECEIPT',
        'DELIVERY',
        'TRANSFER_IN',
        'TRANSFER_OUT',
        'ADJUSTMENT_ADD',
        'ADJUSTMENT_SUB',
        'ORDER_FULFILLMENT',
        'INITIAL_STOCK',
      ],
    },
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
    deltaQuantity: {
      type: Number,
      required: true, // + or -
    },
    balanceAfter: {
      type: Number,
      required: true, // stock in this warehouse after delta
    },
    totalSystemBalanceAfter: {
      type: Number,
      default: 0,
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    operationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryOperation',
    },
    reference: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

stockLedgerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
