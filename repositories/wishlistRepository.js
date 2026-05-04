const User = require("../db/models/User");
const Wishlist = require("../db/models/Wishlist");
const Product = require("../db/models/Product");
const { getOrCreateUser } = require("./cartRepository");

async function addToWishlist(phone, productId) {
  const user = await getOrCreateUser(phone);
  
  // Get product to ensure it exists
  const product = await Product.findOne({ id: productId });
  if (!product) {
    throw new Error("Product not found");
  }
  
  // Check if already in wishlist
  const existing = await Wishlist.findOne({ user: user.id, productId });
  if (!existing) {
    await Wishlist.create({
      user: user.id,
      product: product._id,
      productId: productId
    });
  }
  
  return getWishlist(phone);
}

async function removeFromWishlist(phone, productId) {
  const user = await getOrCreateUser(phone);
  
  await Wishlist.deleteOne({ user: user.id, productId });
  
  return getWishlist(phone);
}

async function getWishlist(phone) {
  const user = await getOrCreateUser(phone);
  
  const wishlistItems = await Wishlist.find({ user: user.id })
    .sort({ createdAt: -1 })
    .lean();
  
  const items = [];
  for (const item of wishlistItems) {
    const product = await Product.findById(item.product).lean();
    if (product) {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.imageUrl
      });
    }
  }
  
  return items;
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist
};
