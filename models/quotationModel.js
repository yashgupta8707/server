// File: models/quotationModel.js
// Mongoose model for quotations
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  id: String,
  category: String,
  component: String,
  quantity: Number,
  unit: String,
  warranty: String,
  purchasePrice: Number,
  purchasePriceWithGST: Number,
  sellingPrice: Number,
  sellingPriceWithGST: Number,
  hsn: String,
  gst: Number
});

const TotalsSchema = new mongoose.Schema({
  subtotal: Number,
  totalGst: Number,
  grandTotal: Number,
  totalProfit: Number,
  totalPurchase: Number,
  profitPercentage: Number,
  hsnTotals: mongoose.Schema.Types.Mixed
});

const BusinessDetailsSchema = new mongoose.Schema({
  companyName: String,
  address: String,
  phone: String,
  email: String,
  gstin: String,
  state: String
});

const CustomerDetailsSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  state: String
});

const QuotationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  businessDetails: BusinessDetailsSchema,
  customerDetails: CustomerDetailsSchema,
  selectedItems: [ItemSchema],
  totals: TotalsSchema,
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'declined', 'expired'],
    default: 'draft'
  },
  expiryDate: {
    type: Date,
    default: function() {
      // Set default expiry to 7 days from creation
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }
  },
  createdBy: String,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add text index for searching
QuotationSchema.index({
  'id': 'text',
  'customerDetails.name': 'text',
  'customerDetails.phone': 'text',
  'selectedItems.component': 'text'
});

// Update the lastModified date on save
QuotationSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Quotation', QuotationSchema);