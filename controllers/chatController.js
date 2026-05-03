const productRepository = require("../repositories/productRepository");
const cartService = require("../services/cartService");
const orderService = require("../services/orderService");
const Order = require("../models/Order");
const orderRepository = require("../repositories/orderRepository");
const invoiceService = require("../services/invoiceService");

const processedMessages = new Set();
const userSelections = {};

const {
  sendWhatsAppMessage,
  sendButtonMessage,
  sendImageMessage,
  sendListMessage
} = require("../services/whatsappService");

const { money, formatCart } = require("../utils/formatters");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================== MAIN HANDLER =====================
async function handleIncomingMessage(req, res) {
  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    if (processedMessages.has(message.id)) return res.sendStatus(200);

    processedMessages.add(message.id);
    setTimeout(() => processedMessages.delete(message.id), 10 * 60 * 1000);

    const phone = message.from;
    const input = message.type === "text"
      ? message.text.body.trim()
      : message.interactive?.button_reply?.id ||
        message.interactive?.list_reply?.id ||
        "";

    console.log(`[MESSAGE] ${phone}: ${input}`);

    await routeMessage(phone, input);

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(200);
  }
}

// ===================== ROUTER =====================
async function routeMessage(phone, input) {
  // Address collection FIRST
  if (userSelections[phone] && userSelections[phone].step === "collect_address") {
    const address = input.trim();
    if (address.length > 10) {
      delete userSelections[phone];
      const order = await orderService.checkout(phone, address);
      return sendWhatsAppMessage(phone, `✅ *Order Placed!*\n\n🧾 Order: ${order.orderCode}\n💰 Total: ₹${order.total.toLocaleString('en-IN')}\n\n🔗 ${order.paymentLink}`);
    }
    return sendWhatsAppMessage(phone, "📝 Address too short. Send full delivery address.");
  }

  // Search state
  if (userSelections[phone] && userSelections[phone].step === "search_products") {
    if (input.trim().length > 1) {
      const results = await productRepository.searchProducts(input, 10);
      delete userSelections[phone];
      return sendSearchResults(phone, input, results);
    }
    return sendWhatsAppMessage(phone, "🔍 Enter product name (min 2 chars):");
  }

  const text = input.toLowerCase();

  // ===== MENU =====
  if (["hi", "hello", "menu", "start"].includes(text)) {
    delete userSelections[phone];
    return sendMainMenu(phone);
  }

  // ===== GLOBAL SEARCH =====
  if (text === "search_products") {
    userSelections[phone] = { step: "search_products" };
    return sendWhatsAppMessage(phone, "🔍 *Search Products*\n\nType product name or keyword:\n\nExamples:\n• shoes\n• tshirt\n• phone\n• bag\n• laptop");
  }

  // ===== CATEGORY =====
  if (text.startsWith("category_")) {
    delete userSelections[phone];
    const category = input.replace("CATEGORY_", "");
    return sendProducts(phone, category);
  }

  // ===== PRODUCT =====
  if (text.startsWith("product_")) {
    delete userSelections[phone];
    const id = input.replace("PRODUCT_", "");
    return sendProductDetail(phone, id);
  }

  // ===== ADD TO CART =====
  if (text.startsWith("add_")) {
    delete userSelections[phone];
    const id = input.replace("ADD_", "");
    return handleAddToCart(phone, id);
  }

  // ===== CART =====
  if (text === "menu_cart") {
    delete userSelections[phone];
    return sendCart(phone);
  }

  // ===== CHECKOUT =====
  if (text === "menu_checkout") {
    delete userSelections[phone];
    return checkout(phone);
  }

  // ===== BROWSE =====
  if (text === "menu_browse") {
    delete userSelections[phone];
    return sendCategories(phone);
  }

  // ===== MY ORDERS =====
  if (text === "my_orders") {
    const orders = await Order.find({ status: "PAID" })
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(5);

    const userOrders = orders.filter(o => o.user?.phone === phone);

    if (!userOrders.length) {
      return sendWhatsAppMessage(phone, "📦 No paid orders found.");
    }

    let msg = "📦 *Your Recent Orders:*\n\n";
    const buttons = [];

    userOrders.slice(0,3).forEach(o => {
      msg += `🧾 ${o.orderCode}\n💰 ₹${Number(o.total).toLocaleString('en-IN')}\n📅 ${o.createdAt.toLocaleDateString('en-IN')}\n\n`;
      buttons.push({ id: `INVOICE_${o.orderCode}`, title: `Invoice ${o.orderCode.slice(-6)}` });
    });
    buttons.push({ id: "MENU_CART", title: "🛒 Cart" });

    return sendButtonMessage(phone, msg, buttons);
  }

  // ===== INVOICE BUTTON =====
  if (input.startsWith("INVOICE_")) {
    const orderCode = input.replace("INVOICE_", "");
    const order = await orderRepository.getOrderByCode(orderCode);

    if (!order || order.user.phone !== phone) {
      return sendWhatsAppMessage(phone, "❌ Order not found or doesn't belong to you.");
    }

    const pdfBuffer = await invoiceService.generateInvoicePDF(order, phone);
    await invoiceService.sendInvoiceViaWhatsApp(phone, orderCode, pdfBuffer);

    return sendWhatsAppMessage(phone, `🧾 Invoice for *${orderCode}* sent!`);
  }

  return sendMainMenu(phone);
}

// ===================== SEARCH RESULTS =====================
async function sendSearchResults(phone, query, products) {
  if (!products.length) {
    return sendButtonMessage(phone, `😕 No products found for "${query}"`, [
      { id: "SEARCH_PRODUCTS", title: "🔍 Try different search" },
      { id: "MENU_BROWSE", title: "🛍️ Browse Categories" }
    ]);
  }

  await sendWhatsAppMessage(phone, `*Search: "${query}"* (${products.length} results)`);

  for (const p of products.slice(0, 3)) {
    const caption = `*${p.name}*\n💰 ₹${p.price}\n${p.category}`;
    
    await sendWhatsAppMessage(phone, caption);
    
    await sendButtonMessage(phone, "Action:", [
      { id: `ADD_${p.id}`, title: "🛒 Add to Cart" },
      { id: `PRODUCT_${p.id}`, title: "👁️ Details" }
    ]);
    await delay(300);
  }

  return sendButtonMessage(phone, "More?", [
    { id: "SEARCH_PRODUCTS", title: "🔍 New Search" },
    { id: "MENU_CART", title: "🛒 Cart" }
  ]);
}

// ===================== MENU =====================
async function sendMainMenu(phone) {
  return sendButtonMessage(phone, "👋 *Welcome to ShopBot!*\n\nWhat would you like?", [
    { id: "MENU_BROWSE", title: "🛍️ Browse Categories" },
    { id: "SEARCH_PRODUCTS", title: "🔍 Search Products" },
    { id: "MENU_CART", title: "🛒 Cart" },
    { id: "MENU_CHECKOUT", title: "💳 Checkout" }
  ]);
}

// ===================== CATEGORIES =====================
async function sendCategories(phone) {
  const categories = await productRepository.getCategories();

  return sendListMessage(
    phone,
    "Choose category:",
    "Browse",
    categories.map(c => ({
      id: `CATEGORY_${c.name}`,
      title: c.name,
      description: `View ${c.name} products`
    }))
  );
}

// ===================== PRODUCTS =====================
async function sendProducts(phone, category) {
  const products = await productRepository.getProductsByCategoryName(category);

  if (!products.length) {
    return sendWhatsAppMessage(phone, `😕 No products in "${category}". Try search!`);
  }

  await sendWhatsAppMessage(phone, `*${category}*`);

  for (const p of products.slice(0, 3)) {
    const caption = `*${p.name}*\n💰 ₹${p.price}`;
    
    await sendWhatsAppMessage(phone, caption);
    
    await sendButtonMessage(phone, "Action:", [
      { id: `ADD_${p.id}`, title: "🛒 Add to Cart" },
      { id: `PRODUCT_${p.id}`, title: "👁️ Details" }
    ]);
    await delay(300);
  }

  return sendButtonMessage(phone, "More?", [
    { id: "MENU_BROWSE", title: "🏠 Categories" },
    { id: "MENU_CART", title: "🛒 Cart" }
  ]);
}

// ===================== PRODUCT DETAIL =====================
async function sendProductDetail(phone, id) {
  const p = await productRepository.getProductById(id);

  if (!p) return sendWhatsAppMessage(phone, "Product not found.");

  const caption = `*${p.name}*\n💰 ₹${p.price}\n${p.category}\n\n${p.description || 'High quality product'}\n\n🆔 ${p.id}`;

  await sendWhatsAppMessage(phone, caption);

  return sendButtonMessage(phone, "Action:", [
    { id: `ADD_${p.id}`, title: "🛒 Add to Cart" },
    { id: "MENU_CART", title: "🛒 Cart" },
    { id: "MENU_BROWSE", title: "🏠 Categories" }
  ]);
}

// ===================== ADD TO CART =====================
async function handleAddToCart(phone, id) {
  const cart = await cartService.addToCart(phone, id);
  return sendButtonMessage(phone, `✅ *Added to cart!*\n\n${formatCart(cart)}`, [
    { id: "MENU_BROWSE", title: "🛍️ Browse More" },
    { id: "MENU_CART", title: "🛒 View Cart" },
    { id: "MENU_CHECKOUT", title: "💳 Checkout" }
  ]);
}

// ===================== CART =====================
async function sendCart(phone) {
  const cart = await cartService.getCart(phone);

  const buttons = [
    { id: "MENU_BROWSE", title: "🛍️ Browse More" },
    { id: "MENU_CHECKOUT", title: "💳 Checkout" },
    { id: "MY_ORDERS", title: "📦 My Orders" },
    { id: "SEARCH_PRODUCTS", title: "🔍 Search" }
  ];

  if (!cart.items.length) {
    return sendButtonMessage(phone, "🛒 Your cart is empty!", buttons);
  }

  return sendButtonMessage(phone, formatCart(cart), buttons);
}

// ===================== CHECKOUT =====================
async function checkout(phone) {
  userSelections[phone] = { step: "collect_address" };
  return sendWhatsAppMessage(phone, "📦 *Delivery Address Required*\n\nPlease send your complete address:");
}

// ===================== MY ORDERS =====================
async function sendMyOrders(phone) {
  const orders = await Order.find({ status: "PAID" })
    .populate("user")
    .sort({ createdAt: -1 })
    .limit(5);

  const userOrders = orders.filter(o => o.user?.phone === phone);

  if (!userOrders.length) {
    return sendButtonMessage(phone, "📦 No paid orders found.\n\nShop more!", [
      { id: "MENU_BROWSE", title: "🛍️ Shop" },
      { id: "MENU_CART", title: "🛒 Cart" }
    ]);
  }

  let msg = "📦 *Your Orders:*\n\n";
  const buttons = userOrders.slice(0,3).map(o => ({
    id: `INVOICE_${o.orderCode}`,
    title: `Invoice ${o.orderCode.slice(-6)}`
  }));
  buttons.push({ id: "MENU_CART", title: "🛒 Cart" });

  return sendButtonMessage(phone, msg, buttons);
}

// ===================== EXPORT =====================
module.exports = {
  handleIncomingMessage
};

