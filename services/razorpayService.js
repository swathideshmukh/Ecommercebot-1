const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function createPaymentLink(amount, phone, orderCode) {
  const response = await razorpay.paymentLink.create({
    amount: Math.round(Number(amount) * 100),
    currency: "INR",
    description: `ShopBot Order ${orderCode}`,
    reference_id: orderCode,
    customer: {
      contact: phone
    },
    notify: {
      sms: true,
      email: false
    },
    reminder_enable: true
  });

  return response.short_url;
}

module.exports = {
  createPaymentLink
};