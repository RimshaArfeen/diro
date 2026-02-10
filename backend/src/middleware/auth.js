const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { AuthenticationError, ForbiddenError } = require('../utils/errors');

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findOne({ userId: decoded.userId });
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    }
    next(error);
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};

// Optional auth - sets req.user if token present, but doesn't fail without it
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findOne({ userId: decoded.userId });
    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Ignore token errors for optional auth
  }
  next();
};

module.exports = { authenticate, generateToken, authorize, optionalAuth };
