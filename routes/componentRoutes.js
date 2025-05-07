// File: routes/componentRoutes.js
// Routes for component operations
const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');

// Get all components grouped by category
router.get('/', componentController.getComponents);

// Get component categories
router.get('/categories', componentController.getCategories);

// Get a single component
router.get('/:id', componentController.getComponent);

// Create a new component
router.post('/', componentController.createComponent);

// Update an existing component
router.put('/:id', componentController.updateComponent);

// Delete a component (soft delete)
router.delete('/:id', componentController.deleteComponent);

// Bulk import components
router.post('/bulk-import', componentController.bulkImport);

module.exports = router;