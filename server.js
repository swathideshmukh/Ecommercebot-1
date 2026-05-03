require("dotenv").config();

const express = require("express");
const connectMongoDB = require("./config/mongodb");

const webhookRoutes = require("./routes/webhook");
const razorpayWebhookRoutes = require("./routes/razorpayWebhook");
const abandonedCartService = require("./services/abandonedCartService");

const app = express();

// 🔥 IMPORTANT: Razorpay webhook MUST use raw BEFORE json
app.use(
  "/razorpay/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhookRoutes
);

// Normal JSON middleware
app.use(express.json());

// Connect MongoDB
connectMongoDB();

// Health check route
app.get("/", async (req, res) => {
  try {
    res.json({
      status: "OK",
      database: "MongoDB connected",
      message: "WhatsApp Commerce Bot running"
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "not connected"
    });
  }
});

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "my_shopbot_123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Verified!");
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});
// WhatsApp webhook
app.use("/webhook", webhookRoutes);

// Manual trigger for testing abandoned carts (remove in production)
app.get("/admin/test-abandoned-carts", async (req, res) => {
  try {
    const count = await abandonedCartService.checkAbandonedCarts();
    res.json({ message: "Done", count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});