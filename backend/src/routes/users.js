const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getWallet,
  linkSocialAccount
} = require('../controllers/users');

// All routes require authentication
router.use(authenticate);

// User profile
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.post('/me/social', linkSocialAccount);

// Wallet
router.get('/me/wallet', (req, res, next) => {
  req.params.userId = req.user.userId;
  getWallet(req, res, next);
});
router.get('/:userId/wallet', authorize('admin'), getWallet);

// Admin user management
router.get('/', authorize('admin'), listUsers);
router.get('/:userId', authorize('admin'), getUser);
router.put('/:userId', authorize('admin'), updateUser);
router.delete('/:userId', authorize('admin'), deleteUser);

module.exports = router;
