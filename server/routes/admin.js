const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin only.' 
    });
  }
  next();
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', [auth, adminOnly], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPortfolios = await Portfolio.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const publicPortfolios = await Portfolio.countDocuments({ isPublic: true });
    
    // Recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Recent logins (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await User.countDocuments({ 
      lastLogin: { $gte: oneDayAgo } 
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPortfolios,
        activeUsers,
        publicPortfolios,
        recentUsers,
        recentLogins
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', [auth, adminOnly], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private/Admin
router.put('/users/:id/toggle-status', [auth, adminOnly], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot change your own status' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/admin/portfolios
// @desc    Get all portfolios
// @access  Private/Admin
router.get('/portfolios', [auth, adminOnly], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const portfolios = await Portfolio.find()
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Portfolio.countDocuments();

    res.json({
      success: true,
      portfolios,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/admin/recent-activity
// @desc    Get recent site activity
// @access  Private/Admin
router.get('/recent-activity', [auth, adminOnly], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email createdAt role');

    // Recent portfolio updates
    const recentPortfolios = await Portfolio.find()
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('user updatedAt personalInfo.title');

    res.json({
      success: true,
      activity: {
        recentUsers,
        recentPortfolios
      }
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/users/:id', [auth, adminOnly], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete your own account' 
      });
    }

    // Delete user's portfolio first
    await Portfolio.findOneAndDelete({ user: req.params.id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User and associated portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/admin/system-info
// @desc    Get system information
// @access  Private/Admin
router.get('/system-info', [auth, adminOnly], async (req, res) => {
  try {
    const dbStats = await mongoose.connection.db.stats();
    
    res.json({
      success: true,
      system: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        database: {
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize
        }
      }
    });

  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
