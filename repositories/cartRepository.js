const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function getOrCreateUser(phone) {
  let user = await User.findOne({ phone }).lean();
  if (!user) {
    user = await User.create({ phone });
  }
  return { id: user._id.toString(), phone: user.phone };
}

async function getOrCreateActiveCart(userId) {
  let cart = await Cart.findOne({
    user: userId,
    status: "ACTIVE"
  }).lean();

  if (!cart) {
    cart = await Cart.create({ user: userId, status: "ACTIVE", items: [] });
  }

  return { id: cart._id.toString() };
}

async function addItem(phone, productId) {
  const user = await getOrCreateUser(phone);
  const cart = await getOrCreateActiveCart(user.id);

  const product = await Product.findOne({
    productId: { $regex: new RegExp(`^${productId}$`, "i") }
  }).lean();

  if (!product) {
    throw new Error("Product not found");
  }

  const cartDoc = await Cart.findById(cart.id);

  const existingItem = cartDoc.items.find(
    (item) => item.product.toString() === product._id.toString()
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartDoc.items.push({ product: product._id, quantity: 1 });
  }

  await cartDoc.save();

  return getCart(phone);
}

async function removeItem(phone, productId) {
  const user = await getOrCreateUser(phone);
  const cart = await getOrCreateActiveCart(user.id);

  const product = await Product.findOne({
    productId: { $regex: new RegExp(`^${productId}$`, "i") }
  }).lean();

  if (!product) {
    throw new Error("Product not found");
  }

  await Cart.findByIdAndUpdate(cart.id, {
    $pull: { items: { product: product._id } }
  });

  return getCart(phone);
}

async function getCart(phone) {
  const user = await getOrCreateUser(phone);
  const cart = await getOrCreateActiveCart(user.id);

  const cartDoc = await Cart.findById(cart.id).populate("items.product").lean();

  const items = (cartDoc.items || []).map((item) => {
    const p = item.product;
    const subtotal = p.price * item.quantity;
    return {
      id: p.productId,
      name: p.name,
      price: p.price,
      quantity: item.quantity,
      subtotal
    };
  });

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  return {
    cartId: cart.id,
    userId: user.id,
    items,
    total
  };
}

async function markCartCheckedOut(cartId) {
  await Cart.findByIdAndUpdate(cartId, { status: "CHECKED_OUT" });
}

module.exports = {
  getOrCreateUser,
  getOrCreateActiveCart,
  addItem,
  removeItem,
  getCart,
  markCartCheckedOut
};
