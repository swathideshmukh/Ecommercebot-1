const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  referralCodeUsed: {
    type: String,
    default: null
  },
  total: {
    type: Number,
    required: true
  },
  paymentLink: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["PLACED", "PAID", "CANCELLED"],
    default: "PLACED"
  },
  trackingStatus: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  address: {
  type: String,
  required: true
}
});

module.exports = mongoose.model("Order", orderSchema);