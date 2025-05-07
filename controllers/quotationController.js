// File: controllers/quotationController.js
// Controller for quotation operations
const Quotation = require('../models/quotationModel');
// Get quotation statistics
exports.getStats = async (req, res) => {
    try {
      // Implement statistics logic here
      const count = await Quotation.countDocuments();
      const statusCounts = await Quotation.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);
      
      res.json({
        total: count,
        byStatus: statusCounts
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get a single quotation
  exports.getQuotation = async (req, res) => {
    try {
      const quotation = await Quotation.findById(req.params.id);
      if (!quotation) {
        return res.status(404).json({ message: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Create a new quotation
  exports.createQuotation = async (req, res) => {
    try {
      const newQuotation = new Quotation(req.body);
      const savedQuotation = await newQuotation.save();
      res.status(201).json(savedQuotation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Update an existing quotation
  exports.updateQuotation = async (req, res) => {
    try {
      const updatedQuotation = await Quotation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedQuotation) {
        return res.status(404).json({ message: 'Quotation not found' });
      }
      res.json(updatedQuotation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Delete a quotation
  exports.deleteQuotation = async (req, res) => {
    try {
      const deletedQuotation = await Quotation.findByIdAndDelete(req.params.id);
      if (!deletedQuotation) {
        return res.status(404).json({ message: 'Quotation not found' });
      }
      res.json({ message: 'Quotation deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Update quotation status
  exports.updateStatus = async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const updatedQuotation = await Quotation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );
      
      if (!updatedQuotation) {
        return res.status(404).json({ message: 'Quotation not found' });
      }
      
      res.json(updatedQuotation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
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