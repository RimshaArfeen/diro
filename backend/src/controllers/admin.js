const AdminSettings = require('../models/AdminSettings');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Clip = require('../models/Clip');
const Payment = require('../models/Payment');
const { ValidationError } = require('../utils/errors');

// GET /api/admin/settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await AdminSettings.getSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/settings
const updateSettings = async (req, res, next) => {
  try {
    const { minCPM, minViewsForPayout, platformCommissionPercentage, payoutSchedule } = req.body;

    const settings = await AdminSettings.getSettings();

    if (minCPM !== undefined) settings.minCPM = minCPM;
    if (minViewsForPayout !== undefined) settings.minViewsForPayout = minViewsForPayout;
    if (platformCommissionPercentage !== undefined) settings.platformCommissionPercentage = platformCommissionPercentage;
    if (payoutSchedule !== undefined) settings.payoutSchedule = payoutSchedule;

    await settings.save();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCreators,
      totalBrands,
      totalCampaigns,
      liveCampaigns,
      totalClips,
      approvedClips,
      revenueData
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'creator', isActive: true }),
      User.countDocuments({ role: 'brand', isActive: true }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'live' }),
      Clip.countDocuments(),
      Clip.countDocuments({ status: 'approved' }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    const deposits = revenueData.find(r => r._id === 'deposit') || { total: 0, count: 0 };
    const payouts = revenueData.find(r => r._id === 'payout') || { total: 0, count: 0 };

    res.json({
      users: { total: totalUsers, creators: totalCreators, brands: totalBrands },
      campaigns: { total: totalCampaigns, live: liveCampaigns },
      clips: { total: totalClips, approved: approvedClips },
      revenue: {
        totalDeposits: deposits.total,
        totalPayouts: payouts.total,
        platformRevenue: deposits.total - payouts.total
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getDashboard
};
