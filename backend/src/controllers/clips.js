const Clip = require('../models/Clip');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const generateId = require('../utils/generateId');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

// POST /api/clips
const submitClip = async (req, res, next) => {
  try {
    const { campaignId, clipLink, originalVideoLink, clipTimestamps, editsDescription } = req.body;

    // Verify campaign exists and is live
    const campaign = await Campaign.findOne({ campaignId });
    if (!campaign) throw new NotFoundError('Campaign');
    if (campaign.status !== 'live') {
      throw new ValidationError('Can only submit clips to live campaigns');
    }

    const clip = await Clip.create({
      clipId: generateId('clip'),
      campaignId,
      creatorId: req.user.userId,
      clipLink,
      originalVideoLink,
      clipTimestamps,
      editsDescription,
      status: 'pending'
    });

    res.status(201).json({ clip });
  } catch (error) {
    next(error);
  }
};

// GET /api/clips
const listClips = async (req, res, next) => {
  try {
    const { campaignId, creatorId, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (campaignId) filter.campaignId = campaignId;
    if (status) filter.status = status;

    // Creators can only see their own clips
    if (req.user.role === 'creator') {
      filter.creatorId = req.user.userId;
    } else if (creatorId) {
      filter.creatorId = creatorId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [clips, total] = await Promise.all([
      Clip.find(filter).skip(skip).limit(parseInt(limit)).sort({ submittedAt: -1 }),
      Clip.countDocuments(filter)
    ]);

    res.json({
      clips,
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

// GET /api/clips/:clipId
const getClip = async (req, res, next) => {
  try {
    const clip = await Clip.findOne({ clipId: req.params.clipId });
    if (!clip) throw new NotFoundError('Clip');

    // Creators can only view their own clips
    if (req.user.role === 'creator' && clip.creatorId !== req.user.userId) {
      throw new ForbiddenError('Cannot view another creator\'s clip');
    }

    res.json({ clip });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/clips/:clipId/status (admin only - approve/flag)
const updateClipStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const clip = await Clip.findOne({ clipId: req.params.clipId });
    if (!clip) throw new NotFoundError('Clip');

    const validTransitions = {
      pending: ['approved', 'flagged'],
      approved: ['flagged'],
      flagged: ['approved']
    };

    if (!validTransitions[clip.status].includes(status)) {
      throw new ValidationError(`Cannot transition from ${clip.status} to ${status}`);
    }

    clip.status = status;
    await clip.save();
    res.json({ clip });
  } catch (error) {
    next(error);
  }
};

// PUT /api/clips/:clipId/views (track views)
const updateViews = async (req, res, next) => {
  try {
    const { views } = req.body;
    if (typeof views !== 'number' || views < 0) {
      throw new ValidationError('Views must be a non-negative number');
    }

    const clip = await Clip.findOne({ clipId: req.params.clipId });
    if (!clip) throw new NotFoundError('Clip');

    if (clip.status !== 'approved') {
      throw new ValidationError('Can only track views on approved clips');
    }

    clip.views = views;
    await clip.calculateEarnings();
    await clip.save();

    // Update creator wallet
    const creatorClips = await Clip.find({ creatorId: clip.creatorId, status: 'approved' });
    const totalEarnings = creatorClips.reduce((sum, c) => sum + c.earnings, 0);

    await User.findOneAndUpdate(
      { userId: clip.creatorId },
      { 'wallet.availableBalance': totalEarnings }
    );

    res.json({ clip });
  } catch (error) {
    next(error);
  }
};

// GET /api/clips/creator/:creatorId/analytics
const getCreatorClipAnalytics = async (req, res, next) => {
  try {
    const creatorId = req.params.creatorId || req.user.userId;

    if (req.user.role === 'creator' && req.user.userId !== creatorId) {
      throw new ForbiddenError('Cannot view another creator\'s analytics');
    }

    const clips = await Clip.find({ creatorId });

    const totalViews = clips.reduce((sum, c) => sum + c.views, 0);
    const totalEarnings = clips.reduce((sum, c) => sum + c.earnings, 0);

    res.json({
      creatorId,
      totalClips: clips.length,
      approvedClips: clips.filter(c => c.status === 'approved').length,
      pendingClips: clips.filter(c => c.status === 'pending').length,
      flaggedClips: clips.filter(c => c.status === 'flagged').length,
      totalViews,
      totalEarnings
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/clips/:clipId
const deleteClip = async (req, res, next) => {
  try {
    const clip = await Clip.findOne({ clipId: req.params.clipId });
    if (!clip) throw new NotFoundError('Clip');

    // Only creator (own clips) or admin can delete
    if (req.user.role === 'creator' && clip.creatorId !== req.user.userId) {
      throw new ForbiddenError('Cannot delete another creator\'s clip');
    }

    if (clip.status === 'approved' && req.user.role !== 'admin') {
      throw new ValidationError('Cannot delete an approved clip');
    }

    await Clip.deleteOne({ clipId: req.params.clipId });
    res.json({ message: 'Clip deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitClip,
  listClips,
  getClip,
  updateClipStatus,
  updateViews,
  getCreatorClipAnalytics,
  deleteClip
};
