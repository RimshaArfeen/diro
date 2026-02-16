const Campaign = require('../models/Campaign');
const User = require('../models/User');
const generateId = require('../utils/generateId');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

// POST /api/campaigns
const createCampaign = async (req, res, next) => {
  try {
    // Permission check: only admin-approved brands can create campaigns
    if (req.user.role === 'brand' && !req.user.canCreateCampaign) {
      throw new ForbiddenError('Not authorized to create campaigns. Please contact admin for approval.');
    }

    const { title, description, sourceVideos, goalViews, CPM, deposit, minViewsForPayout } = req.body;

    const campaign = await Campaign.create({
      campaignId: generateId('camp'),
      brandId: req.user.userId,
      title,
      description,
      sourceVideos,
      goalViews,
      CPM,
      deposit,
      minViewsForPayout,
      status: 'pending'
    });

    res.status(201).json({ campaign });
  } catch (error) {
    next(error);
  }
};

// GET /api/campaigns
const listCampaigns = async (req, res, next) => {
  try {
    const { status, brandId, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (brandId) filter.brandId = brandId;

    // Visibility rules:
    // - Admins: see all campaigns (no filter)
    // - Brands: see only their own campaigns (all statuses)
    // - Creators / Public: see only live (approved & active) campaigns
    if (!req.user) {
      filter.status = 'live';
    } else if (req.user.role === 'brand') {
      filter.brandId = req.user.userId;
    } else if (req.user.role === 'creator') {
      // Creators can only see live campaigns — hide pending, rejected, completed
      filter.status = 'live';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [campaigns, total] = await Promise.all([
      Campaign.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Campaign.countDocuments(filter)
    ]);

    // Populate brand details for admin
    let campaignsWithBrand = campaigns;
    if (req.user && req.user.role === 'admin') {
      const brandIds = [...new Set(campaigns.map(c => c.brandId))];
      const brands = await User.find({ userId: { $in: brandIds } }).select('userId name email');
      const brandMap = {};
      brands.forEach(b => {
        brandMap[b.userId] = { name: b.name, email: b.email };
      });

      campaignsWithBrand = campaigns.map(c => {
        const campaign = c.toObject();
        campaign.brandDetails = brandMap[c.brandId] || { name: 'Unknown', email: '' };
        return campaign;
      });
    }

    res.json({
      campaigns: campaignsWithBrand,
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

// GET /api/campaigns/:campaignId
const getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ campaignId: req.params.campaignId });
    if (!campaign) throw new NotFoundError('Campaign');

    // Visibility rules:
    // - Public / Creators: can only view live campaigns
    // - Brands: can only view their own campaigns
    // - Admins: can view all
    if (!req.user && campaign.status !== 'live') {
      throw new NotFoundError('Campaign');
    } else if (req.user && req.user.role === 'creator' && campaign.status !== 'live') {
      // Creators cannot access inactive/unapproved campaigns (even via direct URL)
      throw new NotFoundError('Campaign');
    } else if (req.user && req.user.role === 'brand' && campaign.brandId !== req.user.userId) {
      throw new ForbiddenError('Cannot view another brand\'s campaign');
    }

    res.json({ campaign });
  } catch (error) {
    next(error);
  }
};

// PUT /api/campaigns/:campaignId
const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ campaignId: req.params.campaignId });
    if (!campaign) throw new NotFoundError('Campaign');

    // Only the brand owner or admin can update
    if (req.user.role === 'brand' && campaign.brandId !== req.user.userId) {
      throw new ForbiddenError('Cannot update another brand\'s campaign');
    }

    // Only allow updates to pending campaigns (unless admin)
    if (req.user.role !== 'admin' && campaign.status !== 'pending') {
      throw new ValidationError('Can only update pending campaigns');
    }

    const allowedFields = ['title', 'description', 'sourceVideos', 'goalViews', 'CPM', 'deposit', 'minViewsForPayout'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    }

    await campaign.save();
    res.json({ campaign });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/campaigns/:campaignId/status
const updateCampaignStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const campaign = await Campaign.findOne({ campaignId: req.params.campaignId });
    if (!campaign) throw new NotFoundError('Campaign');

    // Validate status transitions
    const validTransitions = {
      pending: ['live', 'rejected'],
      live: ['completed'],
      completed: [],
      rejected: []
    };

    if (!validTransitions[campaign.status].includes(status)) {
      throw new ValidationError(`Cannot transition from ${campaign.status} to ${status}`);
    }

    campaign.status = status;
    await campaign.save();
    res.json({ campaign });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/campaigns/:campaignId (admin only)
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ campaignId: req.params.campaignId });
    if (!campaign) throw new NotFoundError('Campaign');

    if (campaign.status === 'live') {
      throw new ValidationError('Cannot delete a live campaign');
    }

    await Campaign.deleteOne({ campaignId: req.params.campaignId });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    next(error);
  }
};

// GET /api/campaigns/:campaignId/analytics
const getCampaignAnalytics = async (req, res, next) => {
  try {
    const Clip = require('../models/Clip');
    const Payment = require('../models/Payment');

    const campaign = await Campaign.findOne({ campaignId: req.params.campaignId });
    if (!campaign) throw new NotFoundError('Campaign');

    // Creators cannot access analytics for non-live campaigns
    if (req.user.role === 'creator' && campaign.status !== 'live') {
      throw new NotFoundError('Campaign');
    }

    if (req.user.role === 'brand' && campaign.brandId !== req.user.userId) {
      throw new ForbiddenError('Cannot view another brand\'s analytics');
    }

    const [clips, totalDeposits] = await Promise.all([
      Clip.find({ campaignId: campaign.campaignId }),
      Payment.aggregate([
        { $match: { campaignId: campaign.campaignId, type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalViews = clips.reduce((sum, clip) => sum + clip.views, 0);
    const totalEarnings = clips.reduce((sum, clip) => sum + clip.earnings, 0);
    const viewProgress = campaign.goalViews > 0 ? (totalViews / campaign.goalViews) * 100 : 0;

    res.json({
      campaignId: campaign.campaignId,
      totalClips: clips.length,
      approvedClips: clips.filter(c => c.status === 'approved').length,
      totalViews,
      totalEarnings,
      totalDeposited: totalDeposits[0]?.total || 0,
      viewProgress: Math.min(viewProgress, 100).toFixed(2),
      remainingBudget: campaign.deposit - totalEarnings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
  getCampaignAnalytics
};
