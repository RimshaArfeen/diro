const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  minCPM: {
    type: Number,
    required: [true, 'Minimum CPM is required'],
    min: [0.01, 'Minimum CPM must be greater than 0']
  },
  minViewsForPayout: {
    type: Number,
    required: [true, 'Minimum views for payout is required'],
    min: [1, 'Minimum views must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Minimum views must be an integer'
    }
  },
  platformCommissionPercentage: {
    type: Number,
    required: [true, 'Platform commission percentage is required'],
    min: [0, 'Commission cannot be negative'],
    max: [100, 'Commission cannot exceed 100%']
  },
  payoutSchedule: {
    type: String,
    required: [true, 'Payout schedule is required'],
    enum: {
      values: ['weekly', 'monthly'],
      message: 'Payout schedule must be weekly or monthly'
    }
  }
}, {
  timestamps: true,
  collection: 'admin_settings'
});

// Singleton pattern: only one admin settings document allowed
adminSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      minCPM: 0.50,
      minViewsForPayout: 1000,
      platformCommissionPercentage: 15,
      payoutSchedule: 'weekly'
    });
  }
  return settings;
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);