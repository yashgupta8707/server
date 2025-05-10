const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ message: 'User account is deactivated' });
    }
    
    // Add user to request object
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user is admin middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Requires admin privileges' });
  }
  next();
};

// Check if user is admin or owner of the resource
exports.isAdminOrOwner = (resourceField) => {
  return (req, res, next) => {
    // Get resource ID from request parameters
    const resourceId = req.params.id;
    
    // Check if user is admin or owner
    if (req.user.role === 'admin' || req.user._id.toString() === req[resourceField]?.createdBy?.toString()) {
      next();
    } else {
      return res.status(403).json({ message: 'Unauthorized to perform this action' });
    }
  };
};