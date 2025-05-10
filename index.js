// server.js - Main server file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const partyRoutes = require('./routes/party.routes');
const quotationRoutes = require('./routes/quotation.routes');
const { verifyToken } = require('./middlewares/auth.middleware');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('Connected to database!');
  })
  .catch((error) => {
    console.log('Database connection failed!');
    console.error(error);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parties', verifyToken, partyRoutes);
app.use('/api/quotations', verifyToken, quotationRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EmpressPC Quotation API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});