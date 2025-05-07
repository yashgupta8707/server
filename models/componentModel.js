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
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single quotation by ID
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({ id: req.params.id });
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new quotation
exports.createQuotation = async (req, res) => {
  try {
    // Check if the ID already exists
    const existingQuotation = await Quotation.findOne({ id: req.body.id });
    if (existingQuotation) {
      return res.status(400).json({ message: 'Quotation with this ID already exists' });
    }
    
    const newQuotation = new Quotation(req.body);
    await newQuotation.save();
    
    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update an existing quotation
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({ id: req.params.id });
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Update fields
    const updatedData = req.body;
    
    // Don't allow changing the ID
    delete updatedData._id;
    delete updatedData.id;
    
    // Update with new data
    Object.assign(quotation, updatedData);
    await quotation.save();
    
    res.json(quotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const result = await Quotation.deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update quotation status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['draft', 'sent', 'accepted', 'declined', 'expired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const quotation = await Quotation.findOne({ id: req.params.id });
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    quotation.status = status;
    await quotation.save();
    
    res.json(quotation);
  } catch (error) {
    console.error('Error updating quotation status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    // Get quotation counts by status
    const statusCounts = await Quotation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get total amount by month for the current year
    const currentYear = new Date().getFullYear();
    const monthlyTotals = await Quotation.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$totals.grandTotal' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get top customers
    const topCustomers = await Quotation.aggregate([
      {
        $group: {
          _id: '$customerDetails.name',
          total: { $sum: '$totals.grandTotal' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    // Format status counts as an object
    const statusCountsObj = statusCounts.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count;
      return acc;
    }, {});
    
    // Format monthly totals as an array
    const monthlyTotalsArr = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthlyTotals.find(item => item._id === month);
      return {
        month,
        total: found ? found.total : 0
      };
    });
    
    res.json({
      statusCounts: statusCountsObj,
      monthlyTotals: monthlyTotalsArr,
      topCustomers
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: error.message });
  }
};
