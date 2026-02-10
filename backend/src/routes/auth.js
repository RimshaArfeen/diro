const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/users');
const validate = require('../middleware/validate');

router.post('/register', validate({
  name: { required: true, type: 'string', minLength: 2 },
  email: { required: true, type: 'string', pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/ },
  password: { required: true, type: 'string', minLength: 8 },
  role: { required: false, type: 'string', enum: ['creator', 'brand'] }
}), register);

router.post('/login', validate({
  email: { required: true, type: 'string' },
  password: { required: true, type: 'string' },
  role: { required: false, type: 'string', enum: ['creator', 'brand'] }
}), login);

module.exports = router;
