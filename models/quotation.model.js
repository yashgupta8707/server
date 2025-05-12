const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuotationSchema = new Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  customer: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Party',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    phone: String,
    address: String,
    state: String
  },
  businessDetails: {
    companyName: String,
    address: String,
    phone: String,
    email: String,
    gstin: String,
    state: String
  },
  items: [
    {
      id: String,
      category: String,
      component: String,
      quantity: {
        type: Number,
        default: 1
      },
      unit: {
        type: String,
        default: 'Pcs'
      },
      warranty: String,
      basePrice: Number,
      customPrice: Number,
      purchasePrice: Number,
      isCustomPrice: {
        type: Boolean,
        default: false
      },
      hsn: String,
      gst: {
        type: Number,
        default: 18
      }
    }
  ],
  totals: {
    subTotal: Number,
    totalGST: Number,
    grandTotal: Number,
    totalProfit: Number,
    profitMargin: Number,
    gstAmounts: Object
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'invoiced'],
    default: 'draft'
  },
  originalQuotationId: {
    type: Schema.Types.ObjectId,
    ref: 'Quotation',
    default: null
  },
  revisionNumber: {
    type: Number,
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Quotation', QuotationSchema);