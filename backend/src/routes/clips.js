const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  submitClip,
  listClips,
  getClip,
  updateClipStatus,
  updateViews,
  getCreatorClipAnalytics,
  deleteClip
} = require('../controllers/clips');

router.use(authenticate);

router.post('/', authorize('creator'), submitClip);
router.get('/', listClips);
router.get('/analytics/me', authorize('creator'), (req, res, next) => {
  req.params.creatorId = req.user.userId;
  getCreatorClipAnalytics(req, res, next);
});
router.get('/analytics/:creatorId', authorize('admin'), getCreatorClipAnalytics);
router.get('/:clipId', getClip);
router.patch('/:clipId/status', authorize('admin'), updateClipStatus);
router.put('/:clipId/views', authorize('admin'), updateViews);
router.delete('/:clipId', authorize('creator', 'admin'), deleteClip);

module.exports = router;
