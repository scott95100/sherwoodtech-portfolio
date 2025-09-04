const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/portfolio', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@portfolio.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
