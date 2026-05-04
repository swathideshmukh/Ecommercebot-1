const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    default: null
  },
  clothingType: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    default: null
  }
});

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
