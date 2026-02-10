const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const db = require('../setup');

const User = require('../../src/models/User');
const Campaign = require('../../src/models/Campaign');
const Clip = require('../../src/models/Clip');
const Payment = require('../../src/models/Payment');
const AdminSettings = require('../../src/models/AdminSettings');
const { generateToken } = require('../../src/middleware/auth');

beforeAll(async () => { await db.connect(); });
afterAll(async () => { await db.disconnect(); });
afterEach(async () => { await db.clearDatabase(); });

// Helper to create a user and get token
const createUserAndToken = async (overrides = {}) => {
  const userData = {
    userId: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: 'Test User',
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: 'Password123',
    role: 'creator',
    ...overrides
  };
  const user = await User.create(userData);
  const token = generateToken(user);
  return { user, token };
};

describe('Auth Flow', () => {
  test('generateToken should create a valid JWT', async () => {
    const { user, token } = await createUserAndToken();
    const decoded = jwt.verify(token, config.jwtSecret);
    expect(decoded.userId).toBe(user.userId);
    expect(decoded.role).toBe(user.role);
  });

  test('should hash password on save', async () => {
    const { user } = await createUserAndToken({ password: 'MySecret123' });
    const savedUser = await User.findOne({ userId: user.userId }).select('+password');
    expect(savedUser.password).not.toBe('MySecret123');
  });

  test('comparePassword should work correctly', async () => {
    const { user } = await createUserAndToken({ password: 'MySecret123' });
    const savedUser = await User.findOne({ userId: user.userId }).select('+password');
    const isMatch = await savedUser.comparePassword('MySecret123');
    expect(isMatch).toBe(true);
    const isWrong = await savedUser.comparePassword('WrongPassword');
    expect(isWrong).toBe(false);
  });
});

describe('Campaign Lifecycle', () => {
  test('should enforce deposit >= goal cost', async () => {
    const campaign = new Campaign({
      campaignId: 'camp-test',
      brandId: 'brand-001',
      title: 'Test Campaign Title',
      description: 'This is a test campaign description',
      sourceVideos: ['https://example.com/video.mp4'],
      goalViews: 100000,
      CPM: 10,
      deposit: 100, // too low: should be 1000
      minViewsForPayout: 1000
    });

    let error;
    try {
      await campaign.validate();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.deposit).toBeDefined();
  });

  test('should allow sufficient deposit', async () => {
    const campaign = new Campaign({
      campaignId: 'camp-test',
      brandId: 'brand-001',
      title: 'Test Campaign Title',
      description: 'This is a test campaign description',
      sourceVideos: ['https://example.com/video.mp4'],
      goalViews: 10000,
      CPM: 5,
      deposit: 50,
      minViewsForPayout: 1000
    });

    let error;
    try {
      await campaign.validate();
    } catch (e) {
      error = e;
    }
    expect(error).toBeUndefined();
  });
});

describe('Clip Earnings', () => {
  test('calculateEarnings should compute based on views and CPM', async () => {
    await Campaign.create({
      campaignId: 'camp-earn',
      brandId: 'brand-001',
      title: 'Earnings Test Campaign',
      description: 'Campaign for testing earnings',
      sourceVideos: ['url'],
      goalViews: 10000,
      CPM: 5.00,
      deposit: 50,
      minViewsForPayout: 100,
      status: 'live'
    });

    const clip = new Clip({
      clipId: 'clip-earn',
      campaignId: 'camp-earn',
      creatorId: 'creator-001',
      clipLink: 'url',
      originalVideoLink: 'url',
      views: 5000,
      status: 'approved'
    });

    const earnings = await clip.calculateEarnings();
    expect(earnings).toBe(25); // (5000/1000) * 5.00
  });
});

describe('Payment Validation', () => {
  test('deposit should require campaignId', async () => {
    const payment = new Payment({
      paymentId: 'pay-test',
      type: 'deposit',
      amount: 100,
      paymentMethod: 'stripe'
    });

    let error;
    try {
      await payment.validate();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.campaignId).toBeDefined();
  });

  test('payout should require creatorId', async () => {
    const payment = new Payment({
      paymentId: 'pay-test',
      type: 'payout',
      amount: 50,
      paymentMethod: 'paypal'
    });

    let error;
    try {
      await payment.validate();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.creatorId).toBeDefined();
  });
});

describe('AdminSettings Singleton', () => {
  test('getSettings should create defaults if none exist', async () => {
    const settings = await AdminSettings.getSettings();
    expect(settings).toBeDefined();
    expect(settings.minCPM).toBe(0.50);
    expect(settings.platformCommissionPercentage).toBe(15);
  });

  test('getSettings should return existing settings', async () => {
    await AdminSettings.create({
      minCPM: 1.00,
      minViewsForPayout: 500,
      platformCommissionPercentage: 20,
      payoutSchedule: 'monthly'
    });

    const settings = await AdminSettings.getSettings();
    expect(settings.minCPM).toBe(1.00);
    expect(settings.platformCommissionPercentage).toBe(20);
  });
});
