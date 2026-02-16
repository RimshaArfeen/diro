const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const generateId = require('../utils/generateId');
const config = require('../config');
const { AuthenticationError, ValidationError } = require('../utils/errors');

const client = new OAuth2Client(config.googleClientId);

// POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      throw new ValidationError('Google credential token is required');
    }

    // Verify the Google ID token on the backend
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId
      });
    } catch (err) {
      throw new AuthenticationError('Invalid Google token');
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      throw new AuthenticationError('Google account does not have an email');
    }

    const userRole = role || 'creator';

    // Check if user exists with this email and role
    let user = await User.findOne({ email, role: userRole });

    if (user) {
      // CASE A: User exists — attach googleId if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // CASE B: User does not exist — create new user
      user = await User.create({
        userId: generateId('user'),
        name,
        email,
        googleId,
        authProvider: 'google',
        role: userRole
      });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        canCreateCampaign: user.canCreateCampaign,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { googleLogin };

