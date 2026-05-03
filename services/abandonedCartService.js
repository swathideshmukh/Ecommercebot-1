const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { sendButtonMessage } = require("./whatsappService");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAbandonedCarts() {
  console.log("[CRON] Checking abandoned carts...");
  
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Find all active carts with items that haven't been reminded in 2-24 hours
  const abandonedCarts = await Cart.find({
    status: "ACTIVE",
    items: { $exists: true, $ne: [] },
    updatedAt: { $gte: twentyFourHoursAgo, $lte: twoHoursAgo }
  })
    .populate("user")
    .populate("items.product");
  
  if (abandonedCarts.length === 0) {
    console.log("[CRON] No abandoned carts found.");
    return 0;
  }
  
  console.log(`[CRON] Found ${abandonedCarts.length} abandoned carts.`);
  
  let sentCount = 0;
  
  for (const cart of abandonedCarts) {
    try {
      // Skip if no user or phone
      if (!cart.user || !cart.user.phone) {
        console.log(`[CRON] Skipping cart ${cart._id} - no user/phone`);
        continue;
      }
      
      // Check if we should send reminder (lastReminderSent null OR more than 24hrs ago)
      if (cart.lastReminderSent) {
        const hoursSinceReminder = (now - cart.lastReminderSent) / (1000 * 60 * 60);
        if (hoursSinceReminder < 24) {
          console.log(`[CRON] Skipping cart ${cart._id} - reminded ${hoursSinceReminder.toFixed(1)} hrs ago`);
          continue;
        }
      }
      
      // Check reminder count (max 2)
      if (cart.reminderCount >= 2) {
        console.log(`[CRON] Skipping cart ${cart._id} - max reminders reached`);
        continue;
      }
      
      // Check if user placed order in last 24 hours
      const recentOrder = await Order.findOne({
        user: cart.user._id,
        status: { $in: ["PLACED", "PAID"] },
        createdAt: { $gte: twentyFourHoursAgo }
      });
      
      if (recentOrder) {
        console.log(`[CRON] Skipping cart ${cart._id} - user placed order recently`);
        continue;
      }
      
      // Build item list (max 3 items)
      let itemList = "";
      let total = 0;
      const maxItems = Math.min(cart.items.length, 3);
      
      for (let i = 0; i < maxItems; i++) {
        const item = cart.items[i];
        const product = item.product;
        if (product) {
          const price = product.price || 0;
          const qty = item.quantity || 1;
          const itemTotal = price * qty;
          total += itemTotal;
          itemList += `${i + 1}. ${product.name} x${qty} — ₹${price.toLocaleString("en-IN")}\n`;
        }
      }
      
      // Add "+ N more" if more than 3 items
      const remaining = cart.items.length - 3;
      if (remaining > 0) {
        itemList += `+ ${remaining} more item${remaining > 1 ? "s" : ""}\n`;
      }
      
      // Build message
      const messageBody = `🛒 *You left something behind!*\n\n${itemList}\n💰 Total: ₹${total.toLocaleString("en-IN")}\n\nComplete your order before items sell out! 🔥`;
      
      const buttons = [
        { id: "MENU_CHECKOUT", title: "💳 Checkout Now" },
        { id: "MENU_BROWSE", title: "🛍️ Keep Shopping" }
      ];
      
      // Send message
      await sendButtonMessage(cart.user.phone, messageBody, buttons);
      
      // Update cart with reminder info
      cart.lastReminderSent = now;
      cart.reminderCount = (cart.reminderCount || 0) + 1;
      await cart.save();
      
      sentCount++;
      console.log(`[CRON] Sent reminder to cart ${cart._id} (phone: ${cart.user.phone})`);
      
      // Add delay to avoid rate limiting
      await delay(500);
      
    } catch (err) {
      console.error(`[CRON] Error processing cart ${cart._id}:`, err.message);
    }
  }
  
  console.log(`[CRON] Completed. Sent ${sentCount} reminders.`);
  return sentCount;
}

module.exports = {
  checkAbandonedCarts
};
