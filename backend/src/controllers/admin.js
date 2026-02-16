const AdminSettings = require('../models/AdminSettings');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Clip = require('../models/Clip');
const Payment = require('../models/Payment');
const { ValidationError, NotFoundError } = require('../utils/errors');

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

// PATCH /api/admin/brand/:id/permission
// Toggle campaign creation permission for a brand user
const updateBrandPermission = async (req, res, next) => {
  try {
    const { canCreateCampaign } = req.body;

    // Validate input
    if (typeof canCreateCampaign !== 'boolean') {
      throw new ValidationError('canCreateCampaign must be a boolean value');
    }

    // Find the brand user by userId
    const brand = await User.findOne({ userId: req.params.id, role: 'brand' });
    if (!brand) {
      throw new NotFoundError('Brand user');
    }

    brand.canCreateCampaign = canCreateCampaign;
    await brand.save();

    res.json({
      message: `Campaign creation ${canCreateCampaign ? 'enabled' : 'disabled'} for ${brand.name}`,
      user: brand
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getDashboard,
  updateBrandPermission
};
