const express = require('express');
const Quotation = require('../models/quotation.model');
const Party = require('../models/party.model');
const { isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// @route   GET /api/quotations
// @desc    Get all quotations
// @access  Private
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // If not admin, show only quotations created by user
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    // Filter by customer
    if (req.query.customer) {
      query['customer.id'] = req.query.customer;
    }
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }
    
    const quotations = await Quotation.find(query)
      .sort({ date: -1 })
      .select('quotationNumber date customer businessDetails totals created_at');
    
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/quotations/:id
// @desc    Get single quotation
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Check if user has access to this quotation
    if (req.user.role !== 'admin' && quotation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to access this quotation' });
    }
    
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/quotations
// @desc    Create a quotation
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      quotationNumber,
      date,
      customer,
      businessDetails,
      items,
      totals,
    } = req.body;
    
    // Create new quotation
    const quotation = new Quotation({
      quotationNumber,
      date: date || new Date(),
      customer,
      businessDetails,
      items,
      totals,
      createdBy: req.user._id,
    });
    
    // If customer.id is provided, check if it exists and update party info
    if (customer && customer.id) {
      const party = await Party.findById(customer.id);
      
      if (party) {
        quotation.customer = {
          id: party._id,
          name: party.name,
          phone: party.phone,
          address: party.address,
          state: party.state,
        };
      }
    }
    
    await quotation.save();
    
    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/quotations/:id
// @desc    Update a quotation
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Find quotation by id
    let quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Check if user has access to update this quotation
    if (req.user.role !== 'admin' && quotation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this quotation' });
    }
    
    const {
      date,
      customer,
      businessDetails,
      items,
      totals,
    } = req.body;
    
    // Update quotation fields
    if (date) quotation.date = date;
    if (customer) quotation.customer = customer;
    if (businessDetails) quotation.businessDetails = businessDetails;
    if (items) quotation.items = items;
    if (totals) quotation.totals = totals;
    
    // If customer.id is provided, check if it exists and update party info
    if (customer && customer.id) {
      const party = await Party.findById(customer.id);
      
      if (party) {
        quotation.customer = {
          id: party._id,
          name: party.name,
          phone: party.phone,
          address: party.address,
          state: party.state,
        };
      }
    }
    
    await quotation.save();
    
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/quotations/:id
// @desc    Delete a quotation
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Find quotation by id
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Check if user has access to delete this quotation
    if (req.user.role !== 'admin' && quotation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this quotation' });
    }
    
    await quotation.deleteOne();
    
    res.json({ message: 'Quotation removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/quotations/stats/summary
// @desc    Get quotation summary statistics
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    let query = {};
    
    // If not admin, show only quotations created by user
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    // Date range filter
    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Default to last month
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    }
    
    let endDate = new Date();
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate);
    }
    
    query.date = {
      $gte: startDate,
      $lte: endDate,
    };
    
    // Get total count and sum
    const [totalStats] = await Quotation.aggregate([
      { $match: query },
      { 
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$totals.grandTotal' },
          totalProfit: { $sum: '$totals.totalProfit' },
        } 
      }
    ]);
    
    // Get monthly breakdown
    const monthlyStats = await Quotation.aggregate([
      { $match: query },
      {
        $group: {
          _id: { 
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totals.grandTotal' },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Get customer breakdown
    const customerStats = await Quotation.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$customer.id',
          customerName: { $first: '$customer.name' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totals.grandTotal' },
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      totalStats: totalStats || { count: 0, totalAmount: 0, totalProfit: 0 },
      monthlyStats,
      customerStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;