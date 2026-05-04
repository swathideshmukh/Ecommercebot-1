const mongoose = require("mongoose");

function generateReferralCode() {
  return "REF" + Math.floor(100000 + Math.random() * 900000);
}

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  referralCode: {
    type: String,
    unique: true,
    default: generateReferralCode
  },

  appliedReferralCode: {
    type: String,
    default: null
  },

  lastActiveAt: {
    type: Date,
    default: Date.now
  },

  reminderSentAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  address: {
  type: String,
  default: null
},

  checkoutStep: {
  type: String,
  default: null
},
});

module.exports = mongoose.model("User", userSchema);