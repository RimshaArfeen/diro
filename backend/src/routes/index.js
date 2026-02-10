const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/campaigns', require('./campaigns'));
router.use('/clips', require('./clips'));
router.use('/payments', require('./payments'));
router.use('/admin', require('./admin'));

module.exports = router;
