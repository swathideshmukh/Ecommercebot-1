const mongoose = require("mongoose");

const browseHistoryEntrySchema = new mongoose.Schema({
  category: { type: String, required: true },
  count: { type: Number, default: 1 },
  lastSeen: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true
    },
    browseHistory: [browseHistoryEntrySchema],
    preferredCategories: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
