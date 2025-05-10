const express = require('express');
const Party = require('../models/party.model');
const { isAdmin, isAdminOrOwner } = require('../middlewares/auth.middleware');

const router = express.Router();

// @route   GET /api/parties
// @desc    Get all parties
// @access  Private
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // If not admin, show only parties created by user
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    // Search query
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by type
    if (req.query.type && ['customer', 'supplier'].includes(req.query.type)) {
      query.type = req.query.type;
    }
    
    const parties = await Party.find(query).sort({ created_at: -1 });
    
    res.json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/parties/:id
// @desc    Get single party
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    // Check if user has access to this party
    if (req.user.role !== 'admin' && party.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to access this party' });
    }
    
    res.json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/parties
// @desc    Create a party
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      gstin,
      address,
      state,
      type,
      notes,
    } = req.body;
    
    // Create new party
    const party = new Party({
      name,
      phone,
      email,
      gstin,
      address,
      state,
      type,
      notes,
      createdBy: req.user._id,
    });
    
    await party.save();
    
    res.status(201).json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/parties/:id
// @desc    Update a party
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Find party by id
    let party = await Party.findById(req.params.id);
    
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    // Check if user has access to update this party
    if (req.user.role !== 'admin' && party.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this party' });
    }
    
    const {
      name,
      phone,
      email,
      gstin,
      address,
      state,
      type,
      notes,
    } = req.body;
    
    // Update party fields
    party.name = name || party.name;
    party.phone = phone || party.phone;
    party.email = email || party.email;
    party.gstin = gstin || party.gstin;
    party.address = address || party.address;
    party.state = state || party.state;
    party.type = type || party.type;
    party.notes = notes || party.notes;
    
    await party.save();
    
    res.json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/parties/:id
// @desc    Delete a party
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Find party by id
    const party = await Party.findById(req.params.id);
    
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    // Check if user has access to delete this party
    if (req.user.role !== 'admin' && party.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this party' });
    }
    
    await party.remove();
    
    res.json({ message: 'Party removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;