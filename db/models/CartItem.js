const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
});

cartItemSchema.index({ cart: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);
