const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  accountNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  balance: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  cards: [
    {
      cardType: String,
      cardVariety: { type: String, default: 'Platinum Elite' },
      cardNumber: String,
      expiry: String,
      cvv: String,
      status: {
        type: String,
        enum: ['active', 'frozen'],
        default: 'active'
      },
      contactless: { type: Boolean, default: true },
      international: { type: Boolean, default: true },
      onlinePayments: { type: Boolean, default: true },
      limit: {
        type: Number,
        default: 50000
      },
      color: { type: String, default: 'dark' }
    }
  ],
  transactions: [
    {
      type: {
        type: String,
        enum: ['send', 'receive', 'withdraw', 'exchange', 'purchase'],
      },
      amount: Number,
      recipient: String,
      date: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        default: 'completed'
      }
    }
  ],
  settings: {
    biometricLogin: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      transactions: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    },
    appearance: {
      theme: { type: String, default: 'system' }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
