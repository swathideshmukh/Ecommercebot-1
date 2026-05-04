const productRepository = require("../repositories/productRepository");
const cartRepository = require("../repositories/cartRepository");

async function getCart(phone) {
  return cartRepository.getCart(phone);
}

async function addToCart(phone, productId, quantity = 1) {
  const product = await productRepository.getProductById(productId);

  if (!product) {
    return null;
  }

  return cartRepository.addItem(phone, product.id, quantity);
}

async function removeFromCart(phone, productId, quantity = 1) {
  return cartRepository.removeItem(phone, productId, quantity);
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart
};