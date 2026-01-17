require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdminAccounts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Admin account details
    const adminData = {
      name: 'GRAMS Admin',
      email: 'pdkalsaria2910@gmail.com',
      password: '123456', // Will be hashed by pre-save hook
      phone: '+919876543210',
      role: 'admin',
      department: 'Administration',
      isActive: true,
    };

    // Engineer account details
    const engineerData = {
      name: 'GRAMS Engineer',
      email: 'engineer@grams.com',
      password: '123456', // Will be hashed by pre-save hook
      phone: '+919876543211',
      role: 'engineer',
      department: 'Engineering',
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists:', adminData.email);
      console.log('   Role:', existingAdmin.role);
    } else {
      const admin = new User(adminData);
      await admin.save();
      console.log('✅ Admin account created successfully!');
      console.log('   Email:', adminData.email);
      console.log('   Password:', adminData.password);
      console.log('   Role:', adminData.role);
    }

    // Check if engineer already exists
    const existingEngineer = await User.findOne({ email: engineerData.email });
    if (existingEngineer) {
      console.log('⚠️  Engineer account already exists:', engineerData.email);
      console.log('   Role:', existingEngineer.role);
    } else {
      const engineer = new User(engineerData);
      await engineer.save();
      console.log('✅ Engineer account created successfully!');
      console.log('   Email:', engineerData.email);
      console.log('   Password:', engineerData.password);
      console.log('   Role:', engineerData.role);
    }

    console.log('\n🎉 Setup complete! You can now login with these accounts:');
    console.log('\n📧 ADMIN LOGIN:');
    console.log('   Email: pdkalsaria2910@gmail.com');
    console.log('   Password: 123456');
    console.log('\n🔧 ENGINEER LOGIN:');
    console.log('   Email: engineer@grams.com');
    console.log('   Password: 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin accounts:', error.message);
    process.exit(1);
  }
};

createAdminAccounts();
