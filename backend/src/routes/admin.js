const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getSettings, updateSettings, getDashboard, updateBrandPermission } = require('../controllers/admin');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/dashboard', getDashboard);

// Brand campaign permission management
router.patch('/brand/:id/permission', updateBrandPermission);

module.exports = router;
