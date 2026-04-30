const productRepository = require("../repositories/productRepository");
const cartRepository = require("../repositories/cartRepository");

async function getCart(phone) {
  return cartRepository.getCart(phone);
}

async function addToCart(phone, productId, options = {}) {
  const product = await productRepository.getProductById(productId);

  if (!product) {
    return null;
  }

  return cartRepository.addItem(phone, product.id, options);
}

async function removeFromCart(phone, productId) {
  return cartRepository.removeItem(phone, productId);
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart
};
