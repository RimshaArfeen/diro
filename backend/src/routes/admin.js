const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getSettings, updateSettings, getDashboard } = require('../controllers/admin');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/dashboard', getDashboard);

module.exports = router;
