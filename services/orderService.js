const cartRepository = require("../repositories/cartRepository");
const orderRepository = require("../repositories/orderRepository");
const { createPaymentLink } = require("./razorpayService");


async function checkout(phone, address) {
  const cart = await cartRepository.getCart(phone);

  if (!cart.items.length) {
    return null;
  }

  const orderCode = `ORD-${Date.now()}`;
  const paymentLink = await createPaymentLink(cart.total, phone, orderCode);

  return orderRepository.createOrderFromCart({
    userId: cart.userId,
    cart,
    paymentLink,
    orderCode,
    address
  });
}


module.exports = {
  checkout
};