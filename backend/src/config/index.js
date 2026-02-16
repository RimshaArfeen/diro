module.exports = {
  mongoURI: process.env.mongoURI || 'mongodb://localhost:27017/diro',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  logLevel: process.env.LOG_LEVEL || 'info',
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE || 'sandbox'
  },
  oauth: {
    instagram: {
      clientId: process.env.OAUTH_INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.OAUTH_INSTAGRAM_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/auth/instagram/callback'
    },
    tiktok: {
      clientId: process.env.OAUTH_TIKTOK_CLIENT_ID,
      clientSecret: process.env.OAUTH_TIKTOK_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_TIKTOK_REDIRECT_URI || 'http://localhost:3000/auth/tiktok/callback'
    },
    youtube: {
      clientId: process.env.OAUTH_YOUTUBE_CLIENT_ID,
      clientSecret: process.env.OAUTH_YOUTUBE_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/youtube/callback'
    }
  }
};