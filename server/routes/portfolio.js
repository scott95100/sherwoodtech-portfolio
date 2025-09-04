const express = require('express');
const { body, validationResult } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/portfolio/:userId
// @desc    Get user's portfolio (public)
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      user: req.params.userId,
      isPublic: true 
    }).populate('user', 'name email avatar');

    if (!portfolio) {
      return res.status(404).json({ 
        success: false,
        message: 'Portfolio not found or not public' 
      });
    }

    res.json({
      success: true,
      portfolio
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/portfolio/my/data
// @desc    Get current user's portfolio
// @access  Private
router.get('/my/data', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.id });

    if (!portfolio) {
      // Create default portfolio if none exists
      portfolio = new Portfolio({
        user: req.user.id,
        personalInfo: {
          title: 'Software Engineer',
          subtitle: 'Full Stack Developer',
          description: 'Passionate about creating innovative solutions'
        },
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: []
      });
      await portfolio.save();
    }

    res.json({
      success: true,
      portfolio
    });

  } catch (error) {
    console.error('Get my portfolio error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/portfolio/my/personal-info
// @desc    Update personal info
// @access  Private
router.put('/my/personal-info', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    portfolio.personalInfo = { ...portfolio.personalInfo, ...req.body };
    await portfolio.save();

    res.json({
      success: true,
      message: 'Personal info updated successfully',
      portfolio
    });

  } catch (error) {
    console.error('Update personal info error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST /api/portfolio/my/skills
// @desc    Add skill
// @access  Private
router.post('/my/skills', [
  auth,
  body('name').notEmpty().withMessage('Skill name is required'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert']).withMessage('Invalid skill level'),
  body('category').isIn(['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    portfolio.skills.push(req.body);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Skill added successfully',
      portfolio
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST /api/portfolio/my/experience
// @desc    Add experience
// @access  Private
router.post('/my/experience', [
  auth,
  body('company').notEmpty().withMessage('Company is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    portfolio.experience.push(req.body);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Experience added successfully',
      portfolio
    });

  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST /api/portfolio/my/projects
// @desc    Add project
// @access  Private
router.post('/my/projects', [
  auth,
  body('title').notEmpty().withMessage('Project title is required'),
  body('description').notEmpty().withMessage('Project description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    portfolio.projects.push(req.body);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Project added successfully',
      portfolio
    });

  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/portfolio/my/visibility
// @desc    Toggle portfolio visibility
// @access  Private
router.put('/my/visibility', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({ 
        success: false,
        message: 'Portfolio not found' 
      });
    }

    portfolio.isPublic = !portfolio.isPublic;
    await portfolio.save();

    res.json({
      success: true,
      message: `Portfolio is now ${portfolio.isPublic ? 'public' : 'private'}`,
      portfolio
    });

  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
