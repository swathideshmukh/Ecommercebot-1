const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const orderService = require("../services/orderService");
const { generateInvoice } = require("../services/invoiceService");

const {
  sendWhatsAppMessage,
  sendDocumentMessage
  
} = require("../services/whatsappService");

router.post("/", async (req, res) => {
  try {
    console.log("✅ RAZORPAY WEBHOOK HIT");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid Razorpay signature");
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());
    
    console.log("EVENT:", event.event);
    console.log("PAYMENT LINK ENTITY:", event.payload?.payment_link?.entity);
    console.log("ORDER CODE FROM RAZORPAY:", event.payload?.payment_link?.entity?.reference_id);

    if (event.event === "payment_link.paid") {
      const paymentLink = event.payload.payment_link.entity;
      const orderCode = paymentLink.reference_id;

      const order = await orderService.markOrderPaid(orderCode);

      console.log("ORDER FOUND AFTER PAYMENT:", order);

      if (order) {
        await sendWhatsAppMessage(
          order.phone,
          `🎉 *Payment Successful!*

🧾 Order: ${order.order_code}
💰 Paid: ₹${Number(order.total).toLocaleString("en-IN")}

🚚 Your order is confirmed and will be delivered soon.

🧾 Invoice is attached below.

Thank you for shopping ❤️`
        );

        const fileName = await generateInvoice({
          orderCode: order.order_code,
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          address: order.address,
          status: "PAID",
          items: order.items || []
        });

        await sendDocumentMessage(
          order.phone,
          `${process.env.BASE_URL}/invoices/${fileName}`,
          fileName,
          "🧾 Your paid ShopBot invoice"
        );
        console.log("✅ Invoice sent successfully:", fileName);
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return res.sendStatus(500);
  }
});

module.exports = router;