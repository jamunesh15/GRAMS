require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkAndSetAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the email from command line argument or use default
    const email = process.argv[2] || 'pdkalsaria2910@gmail.com';
    
    console.log(`\n🔍 Checking user: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }
    
    console.log('\n📋 Current User Details:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    
    if (user.role !== 'admin') {
      console.log('\n🔄 Updating role to admin...');
      user.role = 'admin';
      await user.save();
      console.log('✅ User role updated to admin successfully!');
    } else {
      console.log('\n✅ User is already an admin!');
    }
    
    console.log('\n🎉 You can now login with:');
    console.log('   Email:', email);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAndSetAdmin();
