require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.log('💡 Server will still run. Phone auth endpoints will work.');
    console.log('📝 To fix: Add your IP to MongoDB Atlas whitelist');
    // Don't exit - let server run for testing phone auth
    return null;
  }
};

module.exports = connectDB;
