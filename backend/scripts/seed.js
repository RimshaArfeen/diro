require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../src/config');

const User = require('../src/models/User');
const Campaign = require('../src/models/Campaign');
const Clip = require('../src/models/Clip');
const Payment = require('../src/models/Payment');
const AdminSettings = require('../src/models/AdminSettings');

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Campaign.deleteMany({}),
      Clip.deleteMany({}),
      Payment.deleteMany({}),
      AdminSettings.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin settings
    const adminSettings = await AdminSettings.create({
      minCPM: 0.50,
      minViewsForPayout: 1000,
      platformCommissionPercentage: 15,
      payoutSchedule: 'weekly'
    });
    console.log('Admin settings created');

    // Create users
    const admin = await User.create({
      userId: 'admin-001',
      name: 'Platform Admin',
      email: 'admin@diro.com',
      password: 'Admin@12345',
      role: 'admin'
    });

    const brand = await User.create({
      userId: 'brand-001',
      name: 'Acme Brand',
      email: 'brand@acme.com',
      password: 'Brand@12345',
      role: 'brand'
    });

    const creator1 = await User.create({
      userId: 'creator-001',
      name: 'Jane Creator',
      email: 'jane@example.com',
      password: 'Creator@12345',
      role: 'creator',
      socialAccounts: {
        instagram: 'jane_creates',
        tiktok: 'jane_creates',
        youtube: 'UC_jane_creates'
      }
    });

    const creator2 = await User.create({
      userId: 'creator-002',
      name: 'John Creator',
      email: 'john@example.com',
      password: 'Creator@12345',
      role: 'creator',
      socialAccounts: {
        tiktok: 'john_creates'
      }
    });
    console.log('Users created: admin, brand, 2 creators');

    // Create campaigns
    const campaign1 = await Campaign.create({
      campaignId: 'camp-001',
      brandId: brand.userId,
      title: 'Summer Product Launch',
      description: 'Promote our new summer product line with creative short clips',
      sourceVideos: ['https://example.com/videos/summer-launch.mp4'],
      goalViews: 100000,
      CPM: 5.00,
      deposit: 500,
      minViewsForPayout: 1000,
      status: 'live'
    });

    const campaign2 = await Campaign.create({
      campaignId: 'camp-002',
      brandId: brand.userId,
      title: 'Brand Awareness Campaign',
      description: 'Create engaging content to increase brand awareness and reach',
      sourceVideos: ['https://example.com/videos/brand-awareness.mp4', 'https://example.com/videos/brand-story.mp4'],
      goalViews: 50000,
      CPM: 3.50,
      deposit: 175,
      minViewsForPayout: 500,
      status: 'pending'
    });
    console.log('Campaigns created: 2');

    // Create clips
    const clip1 = await Clip.create({
      clipId: 'clip-001',
      campaignId: campaign1.campaignId,
      creatorId: creator1.userId,
      clipLink: 'https://tiktok.com/@jane/clip001',
      originalVideoLink: campaign1.sourceVideos[0],
      clipTimestamps: ['00:00:05', '00:00:30'],
      editsDescription: 'Added trending music and transitions',
      views: 5000,
      earnings: 25.00,
      status: 'approved'
    });

    const clip2 = await Clip.create({
      clipId: 'clip-002',
      campaignId: campaign1.campaignId,
      creatorId: creator2.userId,
      clipLink: 'https://tiktok.com/@john/clip002',
      originalVideoLink: campaign1.sourceVideos[0],
      clipTimestamps: ['00:01:00', '00:01:45'],
      views: 1200,
      earnings: 6.00,
      status: 'pending'
    });
    console.log('Clips created: 2');

    // Create payments
    await Payment.create({
      paymentId: 'pay-001',
      type: 'deposit',
      campaignId: campaign1.campaignId,
      amount: 500,
      status: 'completed',
      paymentMethod: 'stripe',
      externalTransactionId: 'pi_test_123'
    });

    await Payment.create({
      paymentId: 'pay-002',
      type: 'payout',
      creatorId: creator1.userId,
      amount: 25.00,
      status: 'pending',
      paymentMethod: 'paypal'
    });
    console.log('Payments created: 2');

    // Update creator wallet
    await User.findOneAndUpdate(
      { userId: creator1.userId },
      {
        'wallet.availableBalance': 25.00,
        'wallet.pendingBalance': 0,
        'wallet.withdrawableBalance': 25.00
      }
    );
    console.log('Creator wallet updated');

    console.log('\nSeed completed successfully!');
    console.log('---');
    console.log(`Admin login: admin@diro.com`);
    console.log(`Brand login: brand@acme.com`);
    console.log(`Creator login: jane@example.com / john@example.com`);
    console.log(`Password for all: [Role]@12345`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
