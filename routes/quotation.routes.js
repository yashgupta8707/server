const express = require('express');
const Quotation = require('../models/quotation.model');
const Party = require('../models/party.model');
const { isAdmin } = require('../middlewares/auth.middleware');
const { generateQuotationNumber } = require('../utils/generators');

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
    
    // Status filter
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    // Revision filter - show only originals or revisions
    if (req.query.revisionType === 'originals') {
      query.originalQuotationId = { $exists: false };
    } else if (req.query.revisionType === 'revisions') {
      query.originalQuotationId = { $exists: true };
    }
    
    const quotations = await Quotation.find(query)
      .sort({ date: -1 })
      .select('quotationNumber date customer businessDetails totals status revisionNumber originalQuotationId createdAt');
    
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/quotations/customer/:customerId
// @desc    Get quotations for specific customer
// @access  Private
router.get('/customer/:customerId', async (req, res) => {
  try {
    let query = {
      'customer.id': req.params.customerId
    };
    
    // If not admin, show only quotations created by user
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    const quotations = await Quotation.find(query)
      .sort({ date: -1 })
      .select('quotationNumber date customer businessDetails totals status revisionNumber originalQuotationId createdAt');
    
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
      date,
      customer,
      businessDetails,
      items,
      totals,
      status = 'draft',
      isRevision = false,
      originalQuotationId = null,
    } = req.body;
    
    // Find or verify customer
    let customerData = customer;
    
    if (customer && customer.id) {
      const party = await Party.findById(customer.id);
      
      if (party) {
        customerData = {
          id: party._id,
          name: party.name,
          phone: party.phone,
          address: party.address,
          state: party.state,
        };
      }
    }
    
    // Generate revision number if this is a revision
    let revisionNumber = null;
    
    if (isRevision && originalQuotationId) {
      // Find original quotation
      const originalQuotation = await Quotation.findById(originalQuotationId);
      if (!originalQuotation) {
        return res.status(404).json({ message: 'Original quotation not found' });
      }
      
      // Count existing revisions
      const existingRevisions = await Quotation.countDocuments({
        originalQuotationId,
      });
      
      revisionNumber = existingRevisions + 1;
    }
    
    // Generate quotation number with customer info and revision
    let quotationNumber;
    
    if (isRevision && revisionNumber) {
      // Get the base quotation number without revision suffix
      const originalQuotation = await Quotation.findById(originalQuotationId);
      const baseQuotationNumber = originalQuotation.quotationNumber.split('_R')[0];
      quotationNumber = `${baseQuotationNumber}_R${revisionNumber}`;
    } else {
      // Generate a new quotation number with customer info
      const customerName = customerData.name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 15)
        .toUpperCase();
      
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      
      quotationNumber = `Q${dateStr}_${customerName}_${randomSuffix}`;
    }
    
    // Create new quotation
    const quotation = new Quotation({
      quotationNumber,
      date: date || new Date(),
      customer: customerData,
      businessDetails,
      items,
      totals,
      status,
      originalQuotationId: isRevision ? originalQuotationId : undefined,
      revisionNumber: isRevision ? revisionNumber : undefined,
      createdBy: req.user._id,
    });
    
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
      status,
    } = req.body;
    
    // Update quotation fields
    if (date) quotation.date = date;
    if (businessDetails) quotation.businessDetails = businessDetails;
    if (items) quotation.items = items;
    if (totals) quotation.totals = totals;
    if (status) quotation.status = status;
    
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
      } else {
        quotation.customer = customer;
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

// @route   POST /api/quotations/:id/revise
// @desc    Create a revision of an existing quotation
// @access  Private
router.post('/:id/revise', async (req, res) => {
  try {
    // Find original quotation
    const originalQuotation = await Quotation.findById(req.params.id);
    
    if (!originalQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Check if user has access to this quotation
    if (req.user.role !== 'admin' && originalQuotation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to access this quotation' });
    }
    
    // Count existing revisions
    const existingRevisions = await Quotation.countDocuments({
      originalQuotationId: originalQuotation._id,
    });
    
    const revisionNumber = existingRevisions + 1;
    
    // Get base quotation number without revision suffix
    const baseQuotationNumber = originalQuotation.quotationNumber.split('_R')[0];
    const newQuotationNumber = `${baseQuotationNumber}_R${revisionNumber}`;
    
    // Create the revision with changes from request body
    const newRevision = new Quotation({
      ...req.body,
      quotationNumber: newQuotationNumber,
      date: new Date(),
      customer: originalQuotation.customer,
      businessDetails: originalQuotation.businessDetails,
      items: originalQuotation.items,
      totals: originalQuotation.totals,
      status: 'draft', // New revisions always start as drafts
      originalQuotationId: originalQuotation._id,
      revisionNumber: revisionNumber,
      createdBy: req.user._id,
    });
    
    // Override with any provided changes
    if (req.body.items) newRevision.items = req.body.items;
    if (req.body.totals) newRevision.totals = req.body.totals;
    if (req.body.businessDetails) newRevision.businessDetails = req.body.businessDetails;
    
    await newRevision.save();
    
    res.status(201).json(newRevision);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/quotations/revisions/:id
// @desc    Get all revisions of a quotation
// @access  Private
router.get('/revisions/:id', async (req, res) => {
  try {
    // Find the original quotation
    const originalQuotation = await Quotation.findById(req.params.id);
    
    if (!originalQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Check if user has access to this quotation
    if (req.user.role !== 'admin' && originalQuotation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to access this quotation' });
    }
    
    // If this is already a revision, find the original
    const originalId = originalQuotation.originalQuotationId || originalQuotation._id;
    
    // Find all revisions of this quotation
    const revisions = await Quotation.find({
      $or: [
        { _id: originalId },
        { originalQuotationId: originalId }
      ]
    }).sort({ revisionNumber: 1 });
    
    res.json(revisions);
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
    
    // Add revision statistics
    const revisionStats = await Quotation.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            isRevision: { $cond: [{ $ifNull: ['$originalQuotationId', false] }, true, false] }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totals.grandTotal' },
        }
      }
    ]);
    
    res.json({
      totalStats: totalStats || { count: 0, totalAmount: 0, totalProfit: 0 },
      monthlyStats,
      customerStats,
      revisionStats: revisionStats.reduce((acc, curr) => {
        acc[curr._id.isRevision ? 'revisions' : 'originals'] = curr;
        return acc;
      }, { originals: { count: 0, totalAmount: 0 }, revisions: { count: 0, totalAmount: 0 } }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;