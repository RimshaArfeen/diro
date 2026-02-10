const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: {
      values: ['deposit', 'payout'],
      message: 'Type must be deposit or payout'
    }
  },
  campaignId: {
    type: String,
    trim: true,
    default: null
  },
  creatorId: {
    type: String,
    trim: true,
    default: null
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'processing', 'completed', 'failed'],
      message: 'Status must be pending, processing, completed, or failed'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['stripe', 'paypal', 'bank'],
      message: 'Payment method must be stripe, paypal, or bank'
    }
  },
  externalTransactionId: {
    type: String,
    trim: true,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Validate that deposit has campaignId and payout has creatorId
paymentSchema.pre('validate', function () {
  if (this.type === 'deposit' && !this.campaignId) {
    this.invalidate('campaignId', 'Campaign ID is required for deposit payments');
  }
  if (this.type === 'payout' && !this.creatorId) {
    this.invalidate('creatorId', 'Creator ID is required for payout payments');
  }
});

// paymentId index auto-created by unique: true
paymentSchema.index({ campaignId: 1 });
paymentSchema.index({ creatorId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);