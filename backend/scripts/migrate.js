require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');

const migrate = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create collections with validators
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map(c => c.name);

    const requiredCollections = ['users', 'campaigns', 'clips', 'payments', 'admin_settings'];

    for (const name of requiredCollections) {
      if (!existingNames.includes(name)) {
        await db.createCollection(name);
        console.log(`Created collection: ${name}`);
      } else {
        console.log(`Collection already exists: ${name}`);
      }
    }

    // Create indexes by loading models (Mongoose auto-creates indexes)
    const User = require('../src/models/User');
    const Campaign = require('../src/models/Campaign');
    const Clip = require('../src/models/Clip');
    const Payment = require('../src/models/Payment');
    const AdminSettings = require('../src/models/AdminSettings');

    await User.ensureIndexes();
    console.log('User indexes ensured');

    await Campaign.ensureIndexes();
    console.log('Campaign indexes ensured');

    await Clip.ensureIndexes();
    console.log('Clip indexes ensured');

    await Payment.ensureIndexes();
    console.log('Payment indexes ensured');

    // Ensure default admin settings
    await AdminSettings.getSettings();
    console.log('Admin settings verified');

    console.log('\nMigration completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

migrate();
