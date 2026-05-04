const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CHECKED_OUT"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true // 🔥 handles createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("Cart", cartSchema);