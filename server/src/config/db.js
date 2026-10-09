const mongoose = require('mongoose');
const { autoMigrateLegacyRelations } = require('../utils/workLocation.util');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    // Tự động kiểm tra và di chuyển dữ liệu cũ sang WorkLocation nếu có
    autoMigrateLegacyRelations().catch((e) => console.error('Migration notice:', e.message));
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
