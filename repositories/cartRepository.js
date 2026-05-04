const User = require("../db/models/User");
const Cart = require("../db/models/Cart");
const CartItem = require("../db/models/CartItem");
const Product = require("../db/models/Product");

async function getOrCreateUser(phone) {
  let user = await User.findOne({ phone });
  
  if (!user) {
    user = await User.create({ phone });
  }
  
  return { id: user._id, phone: user.phone };
}

async function getOrCreateActiveCart(userId) {
  let cart = await Cart.findOne({ user: userId, status: "ACTIVE" });
  
  if (!cart) {
    cart = await Cart.create({ user: userId });
  }
  
  return { id: cart._id };
}

async function addItem(phone, productId, quantity = 1) {
  const user = await getOrCreateUser(phone);
  const cart = await getOrCreateActiveCart(user.id);

  quantity = Math.max(1, Number(quantity) || 1);

  const product = await Product.findOne({ id: productId });
  if (!product) {
    throw new Error("Product not found");
  }

  let cartItem = await CartItem.findOne({ cart: cart.id, productId });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    await CartItem.create({
      cart: cart.id,
      product: product._id,
      productId,
      quantity
    });
  }

  return getCart(phone);
}

async function removeItem(phone, productId, quantity = 1) {
  const user = await getOrCreateUser(phone);
  const cart = await getOrCreateActiveCart(user.id);

  quantity = Math.max(1, Number(quantity) || 1);

  const cartItem = await CartItem.findOne({ cart: cart.id, productId });

  if (!cartItem) {
    return getCart(phone);
  }

  cartItem.quantity -= quantity;

  if (cartItem.quantity <= 0) {
    await CartItem.deleteOne({ _id: cartItem._id });
  } else {
    await cartItem.save();
  }

  return getCart(phone);
}

async function getCart(phone) {
  const user = await getOrCreateUser(phone);
  const cart = await getOrCreateActiveCart(user.id);
  
  const cartItems = await CartItem.find({ cart: cart.id }).lean();
  
  const items = [];
  let total = 0;
  
  for (const item of cartItems) {
    const product = await Product.findById(item.product).lean();
    if (product) {
      const subtotal = product.price * item.quantity;
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: subtotal
      });
      total += subtotal;
    }
  }
  
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
