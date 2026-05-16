const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vitalis');
    
    // Clear existing users to avoid duplicates
    await User.deleteMany({ email: 'admin@vitalis.com' });
    await User.deleteMany({ email: 'patient@vitalis.com' });

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      name: 'System Admin',
      email: 'admin@vitalis.com',
      password: 'admin123', // User model has pre-save hook to hash, but let's be explicit if needed. 
      // Actually, our User.js has a pre-save hook, so we can just pass plain password.
      role: 'admin'
    });

    // Create a Patient
    await User.create({
      name: 'Mark Roberts',
      email: 'patient@vitalis.com',
      password: 'patient123',
      role: 'patient'
    });

    console.log('✅ Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedAdmin();
