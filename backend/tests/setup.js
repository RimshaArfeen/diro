// Global test setup for integration tests
// Include this in test files that need database access:
//   require('../setup');
// Or add to jest config as setupFilesAfterSetup

const mongoose = require('mongoose');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/diro_test';

module.exports = {
  connect: async () => {
    await mongoose.connect(TEST_DB_URI, {
      serverSelectionTimeoutMS: 5000
    });
  },
  disconnect: async () => {
    await mongoose.connection.close();
  },
  clearDatabase: async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};
