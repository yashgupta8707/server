// seedUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
.then(async () => {
  console.log('Connected to MongoDB Atlas');

  // Define the user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = new User({
    name: 'Administrator',
    email: 'admin@empresspc.in',
    password: hashedPassword,
    role: 'admin',
  });

  await user.save();
  console.log('User created:', user);

  mongoose.disconnect();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});
