require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');

const updateIndexes = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get existing indexes
    const indexes = await usersCollection.indexes();
    console.log('\nExisting indexes:');
    indexes.forEach(idx => console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`));

    // Drop the old unique email index if it exists
    try {
      await usersCollection.dropIndex('email_1');
      console.log('\n✓ Dropped old email_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('\n✓ email_1 index does not exist (already dropped or never created)');
      } else {
        throw err;
      }
    }

    // Create new compound unique index on email + role
    await usersCollection.createIndex(
      { email: 1, role: 1 },
      { unique: true, name: 'email_1_role_1' }
    );
    console.log('✓ Created new compound index: email_1_role_1');

    // Verify new indexes
    const newIndexes = await usersCollection.indexes();
    console.log('\nUpdated indexes:');
    newIndexes.forEach(idx => console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`));

    console.log('\n✅ Index update completed successfully!');
    console.log('\nNow same email can be used for different roles (creator & brand)');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Index update failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

updateIndexes();
