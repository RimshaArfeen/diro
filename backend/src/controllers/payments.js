const Payment = require('../models/Payment');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const generateId = require('../utils/generateId');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

// POST /api/payments/deposit
const createDeposit = async (req, res, next) => {
  try {
    const { campaignId, amount, paymentMethod } = req.body;

    const campaign = await Campaign.findOne({ campaignId });
    if (!campaign) throw new NotFoundError('Campaign');

    if (req.user.role === 'brand' && campaign.brandId !== req.user.userId) {
      throw new ForbiddenError('Cannot deposit to another brand\'s campaign');
    }

    const payment = await Payment.create({
      paymentId: generateId('pay'),
      type: 'deposit',
      campaignId,
      amount,
      paymentMethod,
      status: 'pending'
    });

    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/payout
const createPayout = async (req, res, next) => {
  try {
    const { creatorId, amount, paymentMethod } = req.body;

    const creator = await User.findOne({ userId: creatorId, role: 'creator' });
    if (!creator) throw new NotFoundError('Creator');

    if (creator.wallet.withdrawableBalance < amount) {
      throw new ValidationError('Insufficient withdrawable balance');
    }

    const payment = await Payment.create({
      paymentId: generateId('pay'),
      type: 'payout',
      creatorId,
      amount,
      paymentMethod,
      status: 'pending'
    });

    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments
const listPayments = async (req, res, next) => {
  try {
    const { type, status, campaignId, creatorId, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (campaignId) filter.campaignId = campaignId;
    if (creatorId) filter.creatorId = creatorId;

    // Non-admins can only see their own payments
    if (req.user.role === 'brand') {
      const campaigns = await Campaign.find({ brandId: req.user.userId }).select('campaignId');
      const campaignIds = campaigns.map(c => c.campaignId);
      filter.$or = [
        { campaignId: { $in: campaignIds } },
        { creatorId: req.user.userId }
      ];
    } else if (req.user.role === 'creator') {
      filter.creatorId = req.user.userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Payment.countDocuments(filter)
    ]);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/:paymentId
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    if (!payment) throw new NotFoundError('Payment');
    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/payments/:paymentId/status (admin - process payment)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, externalTransactionId } = req.body;
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    if (!payment) throw new NotFoundError('Payment');

    const validTransitions = {
      pending: ['processing', 'completed', 'failed'],
      processing: ['completed', 'failed'],
      completed: [],
      failed: ['pending']
    };

    if (!validTransitions[payment.status].includes(status)) {
      throw new ValidationError(`Cannot transition from ${payment.status} to ${status}`);
    }

    payment.status = status;
    if (externalTransactionId) {
      payment.externalTransactionId = externalTransactionId;
    }

    await payment.save();

    // If payout completed, update creator wallet
    if (payment.type === 'payout' && status === 'completed' && payment.creatorId) {
      await User.findOneAndUpdate(
        { userId: payment.creatorId },
        { $inc: { 'wallet.withdrawableBalance': -payment.amount } }
      );
    }

    // If deposit completed, update campaign deposit
    if (payment.type === 'deposit' && status === 'completed' && payment.campaignId) {
      await Campaign.findOneAndUpdate(
        { campaignId: payment.campaignId },
        { $inc: { deposit: payment.amount } }
      );
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/audit
const getPaymentAudit = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [deposits, payouts, summary] = await Promise.all([
      Payment.aggregate([
        { $match: { ...filter, type: 'deposit' } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { ...filter, type: 'payout' } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: filter },
        { $group: { _id: null, totalTransactions: { $sum: 1 }, totalVolume: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      deposits,
      payouts,
      summary: summary[0] || { totalTransactions: 0, totalVolume: 0 }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDeposit,
  createPayout,
  listPayments,
  getPayment,
  updatePaymentStatus,
  getPaymentAudit
};
