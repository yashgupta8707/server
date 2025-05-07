// File: controllers/quotationController.js
// Controller for quotation operations
const Quotation = require('../models/quotationModel');

// Get all quotations
exports.getQuotations = async (req, res) => {
  try {
    // Support for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    let filter = {};
    
    // Handle search query
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Handle date range filtering
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Handle status filtering
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Handle customer filtering
    if (req.query.customer) {
      filter['customerDetails.name'] = { $regex: req.query.customer, $options: 'i' };
    }

    // Query execution
    const quotations = await Quotation.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Count total documents for pagination
    const total = await Quotation.countDocuments(filter);
    
    res.json({
      quotations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};