const Category = require("../models/Category");
const Product = require("../models/Product");

// Hide internal / subcategory names from main category list
const hiddenCategories = [
  "Leather Bags", "Normal Bags", "Travel Bags",
  "Self Help Books", "Finance Books", "Programming Books",
  "Cookware", "Kitchen Tools", "Appliances",
  "Audio Devices", "Computer Accessories", "Smart Gadgets",
  "Rice and Grains", "Dairy and Eggs", "Daily Essentials",
  "Lighting Decor", "Wall Decor", "Soft Furnishing",
  "Face Makeup", "Eye Makeup", "Lip and Nail",
  "Apple Phones", "Samsung Phones", "Motorola Phones",
  "Casual Shoes", "Formal Shoes", "Sports Shoes",
  "Smart Watches", "Analog Watches", "Sports Watches"
];

// ============================
// GET MAIN CATEGORIES
// ============================
async function getCategories() {
  const rows = await Category.find({
    name: { $nin: hiddenCategories }
  })
    .sort({ name: 1 })
    .lean();

  return rows.map((r) => ({
    id: r._id.toString(),
    name: r.name
  }));
}

// ============================
// GET PRODUCTS BY CATEGORY (WITH OPTIONAL FILTERS)
// ============================
async function getProductsByCategoryName(categoryName, filters = {}) {
  const category = await Category.findOne({
    name: { $regex: new RegExp(`^${categoryName}$`, "i") }
  }).lean();

  if (!category) return [];

  const query = {
    category: category._id,
    isActive: true
  };

  // Optional filters (only applied if exist)
  if (filters.gender) {
    query.gender = { $regex: new RegExp(`^${filters.gender}$`, "i") };
  }

  if (filters.clothingType) {
    query.clothingType = {
      $regex: new RegExp(`^${filters.clothingType}$`, "i")
    };
  }

  if (filters.brand) {
    query.brand = { $regex: new RegExp(`^${filters.brand}$`, "i") };
  }

  const products = await Product.find(query)
    .sort({ name: 1 })
    .lean();

  return products.map((p) => ({
    id: p.productId,
    name: p.name,
    price: p.price,
    description: p.description,
    image_url: p.imageUrl,
    gender: p.gender,
    clothing_type: p.clothingType,
    size: p.size,
    color: p.color,
    category: category.name
  }));
}

// ============================
// GET PRODUCT BY ID
// ============================
async function getProductById(productId) {
  const product = await Product.findOne({
    productId: { $regex: new RegExp(`^${productId}$`, "i") },
    isActive: true
  }).lean();

  if (!product) return null;

  const category = await Category.findById(product.category)
    .select("name")
    .lean();

  return {
    id: product.productId,
    name: product.name,
    price: product.price,
    description: product.description,
    image_url: product.imageUrl,
    gender: product.gender,
    clothing_type: product.clothingType,
    size: product.size,
    color: product.color,
    category: category ? category.name : ""
  };
}

// ============================
// GET CLOTHING TYPES BY GENDER
// ============================
async function getClothingTypesByGender(gender) {
  const types = await Product.distinct("clothingType", {
    gender: { $regex: new RegExp(`^${gender}$`, "i") },
    clothingType: { $ne: null },
    isActive: true
  });

  return types.map((t) => ({
    clothing_type: t
  }));
}

// ============================
// GET CLOTHING PRODUCTS
// ============================
async function getClothingProducts(gender, clothingType) {
  const products = await Product.find({
    gender: { $regex: new RegExp(`^${gender}$`, "i") },
    clothingType: {
      $regex: new RegExp(`^${clothingType}$`, "i")
    },
    isActive: true
  })
    .sort({ name: 1 })
    .populate("category", "name") // ✅ optimized (no manual query)
    .lean();

  return products.map((p) => ({
    id: p.productId,
    name: p.name,
    price: p.price,
    description: p.description,
    image_url: p.imageUrl,
    gender: p.gender,
    clothing_type: p.clothingType,
    size: p.size,
    color: p.color,
    category: p.category ? p.category.name : ""
  }));
}

// ============================
// EXPORTS
// ============================
module.exports = {
  getCategories,
  getProductsByCategoryName,
  getProductById,
  getClothingTypesByGender,
  getClothingProducts
};