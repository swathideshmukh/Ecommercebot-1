const express = require("express");

const Product = require("../db/models/Product");
const User = require("../db/models/User");

const {
  sendImageMessage,
  sendButtonMessage,
  sendWhatsAppMessage
} = require("../services/whatsappService");

const router = express.Router();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. Broadcast product offer
router.get("/broadcast-product", async (req, res) => {
  try {
    const productId = req.query.product;

    if (!productId) {
      return res.send("Use: /notifications/broadcast-product?product=PRODUCT_ID");
    }

    const product = await Product.findOne({
      id: productId,
      isActive: true
    });

    if (!product) {
      return res.send("Product not found");
    }

    const users = await User.find({}, { phone: 1 });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        if (product.imageUrl) {
          await sendImageMessage(
            user.phone,
            product.imageUrl,
            `🔥 *Hot Deal!*

🛍️ *${product.name}*
💰 ₹${Number(product.price).toLocaleString("en-IN")}
🆔 ${product.id}
📂 ${product.category || "Product"}
🏷️ ${product.clothingType || "General"}

${product.description || "Limited time offer!"}

⚡ Hurry! Limited stock.`
          );
        } else {
          await sendWhatsAppMessage(
            user.phone,
            `🔥 *Hot Deal!*

🛍️ *${product.name}*
💰 ₹${Number(product.price).toLocaleString("en-IN")}
🆔 ${product.id}

${product.description || "Limited time offer!"}`
          );
        }

        await sleep(700);

        await sendButtonMessage(user.phone, "Choose an option:", [
          { id: `ADD_${product.id}`, title: "🛒 Buy Now" },
          { id: `WISH_${product.id}`, title: "❤️ Wishlist" },
          { id: "MENU_CART", title: "View Cart" }
        ]);

        sent++;
      } catch (err) {
        console.error("Broadcast failed for:", user.phone, err.message);
        failed++;
      }
    }

    res.send(`Broadcast done ✅ Sent: ${sent}, Failed: ${failed}`);
  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).send("Error");
  }
});

// 2. Send text notification to all users
router.post("/broadcast-message", express.json(), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const users = await User.find({}, { phone: 1 });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await sendButtonMessage(user.phone, message, [
          { id: "MENU_BROWSE", title: "Browse" },
          { id: "MENU_CART", title: "Cart" },
          { id: "MAIN_MENU", title: "Menu" }
        ]);

        sent++;
        await sleep(500);
      } catch (err) {
        failed++;
      }
    }

    res.json({ success: true, sent, failed });
  } catch (error) {
    console.error("Message broadcast error:", error);
    res.status(500).json({ success: false });
  }
});

// 3. New arrivals by category
router.get("/new-arrivals", async (req, res) => {
  try {
    const category = req.query.category;

    const products = await Product.find({
      isActive: true,
      ...(category ? { category } : {})
    })
      .sort({ _id: -1 })
      .limit(5);

    if (!products.length) {
      return res.send("No products found");
    }

    const users = await User.find({}, { phone: 1 });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await sendWhatsAppMessage(
          user.phone,
          `🆕 *New Arrivals!*

${products
  .map(
    (p, i) =>
      `${i + 1}. ${p.name}
💰 ₹${Number(p.price).toLocaleString("en-IN")}
🆔 ${p.id}`
  )
  .join("\n\n")}`
        );

        await sendButtonMessage(user.phone, "Want to shop now?", [
          { id: "MENU_BROWSE", title: "Browse" },
          { id: "MENU_CART", title: "Cart" },
          { id: "MAIN_MENU", title: "Menu" }
        ]);

        sent++;
        await sleep(600);
      } catch (err) {
        failed++;
      }
    }

    res.send(`New arrivals sent ✅ Sent: ${sent}, Failed: ${failed}`);
  } catch (error) {
    console.error("New arrivals error:", error);
    res.status(500).send("Error");
  }
});

module.exports = router;