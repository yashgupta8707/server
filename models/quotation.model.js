const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    customer: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
      },
      name: String,
      phone: String,
      address: String,
      state: String,
    },
    businessDetails: {
      companyName: { type: String, required: true },
      address: String,
      phone: String,
      email: String,
      gstin: String,
      state: String,
    },
    items: [{
      id: String,
      category: String,
      component: String,
      quantity: Number,
      unit: String,
      warranty: String,
      basePrice: Number,
      customPrice: Number,
      purchasePrice: Number,
      isCustomPrice: Boolean,
      hsn: String,
      gst: Number,
    }],
    totals: {
      subtotal: Number,
      totalGst: Number,
      grandTotal: Number,
      totalProfit: Number,
      hsnTotals: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;