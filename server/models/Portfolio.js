const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    location: String,
    phone: String,
    resumeUrl: String
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Other'],
      required: true
    }
  }],
  experience: [{
    company: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: String,
    technologies: [String],
    achievements: [String]
  }],
  education: [{
    institution: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: String,
    description: String
  }],
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    technologies: [String],
    githubUrl: String,
    liveUrl: String,
    imageUrl: String,
    featured: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuer: {
      type: String,
      required: true
    },
    date: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#396A85'
    },
    secondaryColor: {
      type: String,
      default: '#8CBDD6'
    },
    accentColor: {
      type: String,
      default: '#72A4BD'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
portfolioSchema.index({ user: 1 });
portfolioSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
