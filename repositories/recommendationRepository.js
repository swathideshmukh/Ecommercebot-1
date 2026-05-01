const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Cross-sell category mapping
const crossellMap = {
  Shoes: "Bags",
  Bags: "Shoes",
  Clothing: "Shoes",
  Electronics: "Bags",
  "Mobile Phones": "Bags",
  Watches: "Bags",
  Makeup: "Bags",
  Grocery: "Cooking Utensils",
  Books: "Books",
  "Cooking Utensils": "Grocery",
  "Home Decor": "Home Decor"
};

// Track browse history for a user
async function trackBrowse(phone, categoryName) {
  const user = await User.findOne({ phone });
  
  if (!user) return;

  // Find existing browse history entry
  const existingEntry = user.browseHistory.find(
    (entry) => entry.category.toLowerCase() === categoryName.toLowerCase()
  );

  if (existingEntry) {
    // Increment count and update lastSeen
    existingEntry.count += 1;
    existingEntry.lastSeen = new Date();
  } else {
    // Add new entry
    user.browseHistory.push({
      category: categoryName,
      count: 1,
      lastSeen: new Date()
    });
  }

  await user.save();
}

// Get top categories for a user
async function getTopCategories(phone, limit = 3) {
  const user = await User.findOne({ phone }).lean();
  
  if (!user || !user.browseHistory || user.browseHistory.length === 0) {
    return [];
  }

  // Sort by count descending
  const sorted = [...user.browseHistory].sort((a, b) => b.count - a.count);
  
  return sorted.slice(0, limit).map((entry) => entry.category);
}

// Get recommended products from user's top category
async function getRecommendedProducts(phone, limit = 4) {
  const topCategories = await getTopCategories(phone, 1);
  
  if (topCategories.length === 0) {
    return [];
  }

  const topCategory = topCategories[0];
  
  // Find category
  const category = await Category.findOne({
    name: { $regex: new RegExp(`^${topCategory}$`, "i") }
  }).lean();

  if (!category) {
    return [];
  }

  // Get products from top category, sorted by price ascending
  const products = await Product.find({
    category: category._id,
    isActive: true
  })
    .sort({ price: 1 })
    .limit(limit)
    .lean();

  return products.map((p) => ({
    id: p.productId,
    name: p.name,
    price: p.price,
    description: p.description,
    image_url: p.imageUrl,
    category: topCategory
  }));
}

// Get cross-sell category based on last order category
function getCrossellCategory(lastOrderCategory) {
  return crossellMap[lastOrderCategory] || "Shoes";
}

module.exports = {
  trackBrowse,
  getTopCategories,
  getRecommendedProducts,
  getCrossellCategory
};
