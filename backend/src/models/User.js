const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [function () { return !this.googleId; }, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  googleId: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: {
      values: ['local', 'google'],
      message: 'Auth provider must be local or google'
    },
    default: 'local'
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['creator', 'brand', 'admin'],
      message: 'Role must be creator, brand, or admin'
    },
    default: 'creator'
  },
  socialAccounts: {
    instagram: { type: String, trim: true, default: null },
    tiktok: { type: String, trim: true, default: null },
    youtube: { type: String, trim: true, default: null }
  },
  wallet: {
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Available balance cannot be negative']
    },
    pendingBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Pending balance cannot be negative']
    },
    withdrawableBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Withdrawable balance cannot be negative']
    }
  },
  // Permission flag: only admin-approved brands can create campaigns
  canCreateCampaign: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// email and userId indexes are auto-created by unique: true in schema
userSchema.index({ role: 1 });
// Compound unique index: same email can be used for different roles
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);