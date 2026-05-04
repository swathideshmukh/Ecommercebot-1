const cartRepository = require("../repositories/cartRepository");
const orderRepository = require("../repositories/orderRepository");
const User = require("../db/models/User");
const { createPaymentLink } = require("./razorpayService");

async function checkout(phone) {
  const cart = await cartRepository.getCart(phone);

  if (!cart.items.length) {
    return null;
  }

  const user = await User.findOne({ phone });

  let subtotal = cart.total;
  let discount = 0;
  let referralCodeUsed = null;

  if (user?.appliedReferralCode) {
    discount = Math.round(subtotal * 0.2);
    referralCodeUsed = user.appliedReferralCode;
  }

  const finalTotal = subtotal - discount;

  const orderCode = `ORD-${Date.now()}`;
  const paymentLink = await createPaymentLink(finalTotal, phone, orderCode);

  return orderRepository.createOrderFromCart({
    userId: cart.userId,
    cart,
    paymentLink,
    orderCode,
    subtotal,
    discount,
    referralCodeUsed,
    finalTotal
  });
}

async function markOrderPaid(orderCode) {
  return orderRepository.markOrderPaid(orderCode);
}

async function getLatestOrder(phone) {
  return orderRepository.getLatestOrderByPhone(phone);
}

async function updateTrackingStatus(orderCode, trackingStatus) {
  return orderRepository.updateTrackingStatus(orderCode, trackingStatus);
}

module.exports = {
  checkout,
  markOrderPaid,
  getLatestOrder,
  updateTrackingStatus
};