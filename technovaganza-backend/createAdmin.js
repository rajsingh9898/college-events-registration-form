const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin data
    const adminData = {
      username: 'srmsadmin',
      email: 'admin@srmscetrevents.in',
      password: 'mahadev@450', // Plain text - will be hashed by pre-save
      role: 'admin'
    };

    // Import Admin model
    const Admin = require('./models/Admin');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'srmsadmin' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists, updating password...');
      existingAdmin.password = 'mahadev@450';
      await existingAdmin.save();
      console.log('✅ Admin password updated');
    } else {
      // Create new admin
      const admin = new Admin(adminData);
      await admin.save();
      console.log('✅ Admin created successfully');
    }

    console.log('🎉 Admin setup completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();