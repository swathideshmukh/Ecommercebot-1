const Order = require("../db/models/Order");
const OrderItem = require("../db/models/OrderItem");
const Cart = require("../db/models/Cart");
const User = require("../db/models/User");

async function createOrderFromCart({
  userId,
  cart,
  paymentLink,
  orderCode,
  subtotal,
  discount,
  referralCodeUsed,
  finalTotal
}) {
  const user = await User.findById(userId);

  const order = await Order.create({
    orderCode,
    user: userId,
    subtotal: subtotal || cart.total,
    discount: discount || 0,
    referralCodeUsed: referralCodeUsed || null,
    total: finalTotal || cart.total,
    paymentLink,
    address: user.address,
    status: "PLACED",
    trackingStatus: "ORDER_PLACED"
  });

  for (const item of cart.items) {
    await OrderItem.create({
      order: order._id,
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity
    });
  }

  await Cart.findByIdAndUpdate(cart.cartId, { status: "CHECKED_OUT" });

  return {
    id: order._id,
    orderCode: order.orderCode,
    items: cart.items,
    subtotal: order.subtotal,
    discount: order.discount,
    address: order.address,
    total: order.total,
    referralCodeUsed: order.referralCodeUsed,
    paymentLink: order.paymentLink,
    status: order.status
  };
}

async function markOrderPaid(orderCode) {
  const order = await Order.findOneAndUpdate(
    { orderCode },
    {
      status: "PAID",
      trackingStatus: "PAYMENT_CONFIRMED"
    },
    { new: true }
  );

  if (!order) {
    return null;
  }

  const user = await User.findById(order.user).lean();
  const items = await OrderItem.find({ order: order._id }).lean();

  return {
  orderCode: order.orderCode,
  order_code: order.orderCode,
  subtotal: order.subtotal,
  discount: order.discount,
  total: order.total,
  address: order.address,
  status: order.status,
  trackingStatus: order.trackingStatus,
  tracking_status: order.trackingStatus,
  phone: user?.phone,
  items: items.map((item) => ({
    name: item.productName,
    price: item.price,
    quantity: item.quantity
  }))
};
}

async function getLatestOrderByPhone(phone) {
  const user = await User.findOne({ phone });
  
  if (!user) {
    return null;
  }
  
  const order = await Order.findOne({ user: user._id })
    .sort({ createdAt: -1 })
    .lean();
  
  if (!order) {
    return null;
  }
  
  return {
    order_code: order.orderCode,
    total: order.total,
    status: order.status,
    tracking_status: order.trackingStatus,
    created_at: order.createdAt
  };
}

async function updateTrackingStatus(orderCode, trackingStatus) {
  return await Order.findOneAndUpdate(
    { orderCode },
    { trackingStatus },
    { returnDocument: "after" }
  );
}


module.exports = {
  createOrderFromCart,
  markOrderPaid,
  getLatestOrderByPhone,
  updateTrackingStatus
};
