const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.user.id);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Token is valid but user no longer exists' 
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'User account is deactivated' 
        });
      }

      req.user = decoded.user;
      next();
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token has expired' 
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error in authentication' 
    });
  }
};

module.exports = auth;
