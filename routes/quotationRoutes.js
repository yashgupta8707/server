// File: routes/quotationRoutes.js
// Routes for quotation operations
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// Get all quotations
router.get('/', quotationController.getQuotations);

// Get quotation statistics
router.get('/stats', quotationController.getStats);

// Get a single quotation
router.get('/:id', quotationController.getQuotation);

// Create a new quotation
router.post('/', quotationController.createQuotation);

// Update an existing quotation
router.put('/:id', quotationController.updateQuotation);

// Delete a quotation
router.delete('/:id', quotationController.deleteQuotation);

// Update quotation status
router.patch('/:id/status', quotationController.updateStatus);

module.exports = router;
