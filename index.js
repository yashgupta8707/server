// server/index.js - Updated server file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
}
// Routes
app.use('/api', apiRoutes);
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/components', require('./routes/componentRoutes'));

app.get('/', (req, res) => {
  res.send('TITAN Gaming Systems API');
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
