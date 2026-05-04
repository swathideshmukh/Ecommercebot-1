const Product = require("../db/models/Product");
const Category = require("../db/models/Category");

function formatProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    image_url: p.imageUrl,
    imageUrl: p.imageUrl,
    gender: p.gender,
    clothing_type: p.clothingType,
    clothingType: p.clothingType,
    size: p.size,
    color: p.color,
    category: p.category
  };
}

async function getCategories() {
  const categories = await Category.find({}).sort({ name: 1 });

  return categories.map((c) => ({
    id: c._id,
    name: c.name
  }));
}

async function getProductsByCategoryName(categoryName) {
  const products = await Product.find({
    isActive: true,
    $or: [
      { category: { $regex: new RegExp(`^${categoryName}$`, "i") } },
      { clothingType: { $regex: new RegExp(`^${categoryName}$`, "i") } }
    ]
  }).sort({ name: 1 });

  return products.map(formatProduct);
}

async function getProductById(productId) {
  const product = await Product.findOne({
    id: { $regex: new RegExp(`^${productId}$`, "i") },
    isActive: true
  });

  if (!product) return null;

  return formatProduct(product);
}

async function getClothingTypesByGender(gender) {
  const types = await Product.distinct("clothingType", {
    gender: { $regex: new RegExp(`^${gender}$`, "i") },
    clothingType: { $ne: null },
    isActive: true
  });

  return types.map((ct) => ({
    clothing_type: ct,
    clothingType: ct
  }));
}

async function getClothingProducts(gender, clothingType) {
  const products = await Product.find({
    gender: { $regex: new RegExp(`^${gender}$`, "i") },
    clothingType: { $regex: new RegExp(`^${clothingType}$`, "i") },
    isActive: true
  }).sort({ name: 1 });

  return products.map(formatProduct);
}

async function searchProducts({ keyword, maxPrice, minPrice, category, subcategory }) {
  const query = { isActive: true };

  if (keyword) {
    const words = keyword.split(" ").filter(Boolean);

    query.$or = words.flatMap((word) => [
      { name: { $regex: word, $options: "i" } },
      { description: { $regex: word, $options: "i" } },
      { category: { $regex: word, $options: "i" } },
      { clothingType: { $regex: word, $options: "i" } },
      { gender: { $regex: word, $options: "i" } },
      { color: { $regex: word, $options: "i" } }
    ]);
  }

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  if (subcategory) {
    query.clothingType = { $regex: subcategory, $options: "i" };
  }

  if (maxPrice || minPrice) {
    query.price = {};
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (minPrice) query.price.$gte = Number(minPrice);
  }

  const products = await Product.find(query)
    .sort({ price: 1 })
    .limit(10);

  return products.map(formatProduct);
}

async function getPersonalizedProducts(category, subcategory, limit = 3) {
  const query = {
    isActive: true
  };

  if (category) {
    query.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

  if (subcategory) {
    query.clothingType = { $regex: new RegExp(`^${subcategory}$`, "i") };
  }

  const products = await Product.find(query)
    .sort({ price: 1 })
    .limit(limit);

  return products.map(formatProduct);
}

module.exports = {
  getCategories,
  getProductsByCategoryName,
  getProductById,
  getClothingTypesByGender,
  getClothingProducts,
  searchProducts,
  getPersonalizedProducts
};