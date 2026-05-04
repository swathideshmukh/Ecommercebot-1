const User = require("../db/models/User");
const { sendButtonMessage } = require("./whatsappService");

async function checkInactiveUsers() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const users = await User.find({
      lastActiveAt: { $lte: oneHourAgo },
      reminderSentAt: null
    });

    for (const user of users) {
      try {
        await sendButtonMessage(
          user.phone,
          `👋 Hey! You were browsing our shop earlier.

Your products are still waiting for you 🛍️

Continue shopping?`,
          [
            { id: "MENU_BROWSE", title: "Browse" },
            { id: "MENU_CART", title: "View Cart" },
            { id: "MENU_CHECKOUT", title: "Checkout" }
          ]
        );

        user.reminderSentAt = new Date();
        await user.save();

        console.log("Reminder sent to:", user.phone);
      } catch (err) {
        console.error("Reminder failed for:", user.phone, err.message);
      }
    }
  } catch (error) {
    console.error("Inactive reminder error:", error.message);
  }
}

function startInactiveReminderJob() {
  console.log("Inactive reminder job started");

  setInterval(checkInactiveUsers, 5 * 60 * 1000);
}

module.exports = {
  startInactiveReminderJob
};