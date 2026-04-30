const Order = require("../models/Order");
const Cart = require("../models/Cart");

async function createOrderFromCart({ userId, cart, paymentLink, orderCode, address }) {
  const order = await Order.create({
    orderCode,
    user: userId,
    total: cart.total,
    paymentLink,
    address,
    status: "PLACED",
    items: cart.items.map((item) => ({
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  });


  await Cart.findByIdAndUpdate(cart.cartId, { status: "CHECKED_OUT" });

  return {
    id: order._id.toString(),
    orderCode: order.orderCode,
    items: cart.items,
    total: order.total,
    paymentLink: order.paymentLink,
    status: order.status
  };
}

async function markOrderPaid(orderCode) {
  const order = await Order.findOneAndUpdate(
    { orderCode },
    { status: "PAID" },
    { new: true }
  ).populate("user");

  if (!order) return null;

  return {
    order_code: order.orderCode,
    total: order.total,
    phone: order.user.phone
  };
}

module.exports = {
  createOrderFromCart,
  markOrderPaid
};
