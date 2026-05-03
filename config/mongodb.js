const mongoose = require("mongoose");
const cron = require("node-cron");
const abandonedCartService = require("../services/abandonedCartService");

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
    
    // Schedule abandoned cart check - runs every hour
    cron.schedule("0 * * * *", async () => {
      console.log("[CRON] Checking abandoned carts...");
      try {
        await abandonedCartService.checkAbandonedCarts();
      } catch (error) {
        console.error("[CRON] Error checking abandoned carts:", error);
      }
    });
    console.log("[CRON] Abandoned cart scheduler started (runs hourly)");
    
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
