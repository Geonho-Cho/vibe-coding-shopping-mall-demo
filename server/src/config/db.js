const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MONGODB_ATLAS_URL > MONGODB_URI > 로컬 MongoDB 순서로 사용
    const mongoUri = process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
