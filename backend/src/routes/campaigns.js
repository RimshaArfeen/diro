const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
  getCampaignAnalytics
} = require('../controllers/campaigns');

// Public routes (optional auth for role-based filtering)
router.get('/', optionalAuth, listCampaigns);
router.get('/:campaignId', optionalAuth, getCampaign);

// Protected routes
router.use(authenticate);
router.post('/', authorize('brand', 'admin'), createCampaign);
router.put('/:campaignId', authorize('brand', 'admin'), updateCampaign);
router.patch('/:campaignId/status', authorize('admin'), updateCampaignStatus);
router.delete('/:campaignId', authorize('admin'), deleteCampaign);
router.get('/:campaignId/analytics', authorize('brand', 'admin'), getCampaignAnalytics);

module.exports = router;
