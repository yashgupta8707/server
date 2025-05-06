// server/models/Configuration.js - MongoDB model for saving custom configurations
const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  specifications: {
    cpu: String,
    gpu: String,
    ram: String,
    storage: String
  },
  color: String,
  price: Number,
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Configuration', configurationSchema);