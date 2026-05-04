const path = require("path");
require("dotenv").config();

const express = require("express");
const webhookRoutes = require("./routes/webhook");
const razorpayWebhookRoutes = require("./routes/razorpayWebhook");
const connectDB = require("./db/connection");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notifications");
const { startInactiveReminderJob } = require("./services/inactiveReminderService");
const app = express();


// Razorpay needs raw body for signature verification
app.use("/razorpay/webhook", express.raw({ type: "application/json" }));
app.use("/razorpay/webhook", razorpayWebhookRoutes);
app.use(express.json());

app.use("/notifications", notificationRoutes);

app.use("/admin", adminRoutes);

// Normal JSON for other routes
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    // Test MongoDB connection
    const mongoose = require("mongoose");
    const state = mongoose.connection.readyState;
    
    if (state === 1) {
      res.json({
        status: "OK",
        database: "connected",
        message: "WhatsApp MongoDB Commerce Bot running"
      });
    } else {
      res.status(500).json({
        status: "ERROR",
        database: "not connected"
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "not connected"
    });
  }
});

app.use("/invoices", express.static(path.join(__dirname, "invoices")));
app.get("/test-invoice", (req, res) => {
  res.send("Invoice route working ✅");
});
app.use("/webhook", webhookRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then(() => {
  startInactiveReminderJob();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
