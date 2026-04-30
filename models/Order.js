const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
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
    total: {
      type: Number,
      required: true
    },

    paymentLink: String,
    address: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["PLACED", "PAID", "CANCELLED"],
      default: "PLACED"
    },

    items: [orderItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
