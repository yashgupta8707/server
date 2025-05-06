// server/routes/api.js - API routes for the ecommerce functionality
const express = require('express');
const router = express.Router();
const Configuration = require('../models/Configuration');
const Product = require('../models/Product');

// Save user configuration
router.post('/configuration', async (req, res) => {
  try {
    const configuration = new Configuration(req.body);
    await configuration.save();
    res.status(201).json(configuration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user configurations
router.get('/configurations/:userId', async (req, res) => {
  try {
    const configurations = await Configuration.find({ userId: req.params.userId });
    res.json(configurations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product details
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
