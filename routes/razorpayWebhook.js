const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const orderRepository = require("../repositories/orderRepository");
const { sendWhatsAppMessage } = require("../services/whatsappService");
const invoiceService = require("../services/invoiceService");

router.post("/", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid Razorpay webhook signature");
      return res.sendStatus(400);
    }

    const event = JSON.parse(req.body.toString());

    if (event.event !== "payment_link.paid") {
      return res.sendStatus(200);
    }

    const paymentLink = event.payload.payment_link.entity;
    const referenceId = paymentLink.reference_id;

    const order = await orderRepository.markOrderPaid(referenceId);

    if (order) {
      await sendWhatsAppMessage(
        order.user.phone,
        `🎉 *Payment Successful!*

Your order is confirmed.

🧾 Order ID: ${order.orderCode}
💰 Paid Amount: ₹${Number(order.total).toLocaleString("en-IN")}

Thank you for shopping with ShopBot!`
      );

      // Send invoice after delay
      setTimeout(async () => {
        try {
          const pdfBuffer = await invoiceService.generateInvoicePDF(order, order.user.phone);
          await invoiceService.sendInvoiceViaWhatsApp(order.user.phone, order.orderCode, pdfBuffer);
        } catch (e) {
          console.error('Invoice send failed:', e);
        }
      }, 1000);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.sendStatus(500);
  }
});

module.exports = router;