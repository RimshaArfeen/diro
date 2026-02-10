const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Ensure default admin settings exist
    const AdminSettings = require('../models/AdminSettings');
    await AdminSettings.getSettings();
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
