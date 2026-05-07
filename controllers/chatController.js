const productRepository = require("../repositories/productRepository");
const cartService = require("../services/cartService");
const orderService = require("../services/orderService");
<<<<<<< Updated upstream
const Order = require("../models/Order");
const orderRepository = require("../repositories/orderRepository");
const invoiceService = require("../services/invoiceService");

=======
const wishlistRepository = require("../repositories/wishlistRepository");
const User = require("../db/models/User");
const fetch = require("node-fetch");
const userPreferenceRepository = require("../repositories/userPreferenceRepository");
const { analyzeImage } = require("../services/imageAIService");
const { generateInvoice } = require("../services/invoiceService");
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  // ===== CATEGORY =====
=======
  if (text.startsWith("product_")) {
    const productId = input.replace("PRODUCT_", "");
    return sendProduct(phone, productId);
  }

  if (text === "category_bags") {
  return sendBagSubcategories(phone);
}

  if (text.startsWith("bagtype_")) {
    const bagType = input.replace("BAGTYPE_", "");
    return sendProducts(phone, bagType);
}

  if (text === "category_books") {
  return sendBookSubcategories(phone);
}

if (text.startsWith("booktype_")) {
  const bookType = input.replace("BOOKTYPE_", "");
  return sendPersonalizedProducts(phone, "Books", bookType);
}

if (text === "category_clothing") {
  return sendClothingGenderOptions(phone);
}

if (text.startsWith("clothgender_")) {
  const gender = input.replace("CLOTHGENDER_", "");
  return sendClothingTypeOptions(phone, gender);
}

if (text.startsWith("clothtype_")) {
  const value = input.replace("CLOTHTYPE_", "");
  const [gender, clothingType] = value.split("|");
  return sendClothingProducts(phone, gender, clothingType);
}

if (text === "category_cooking utensils") {
  return sendCookingSubcategories(phone);
}

if (text.startsWith("cooktype_")) {
  const cookType = input.replace("COOKTYPE_", "");
  return sendProducts(phone, cookType);
}

if (text === "category_electronics") {
  return sendElectronicsSubcategories(phone);
}

if (text.startsWith("electype_")) {
  const elecType = input.replace("ELECTYPE_", "");
  return sendProducts(phone, elecType);
}

if (text === "category_grocery") {
  return sendGrocerySubcategories(phone);
}

if (text.startsWith("grocerytype_")) {
  const groceryType = input.replace("GROCERYTYPE_", "");
  return sendProducts(phone, groceryType);
}
  if (text === "category_home decor") {
  return sendHomeDecorSubcategories(phone);
}

if (text.startsWith("homedecortype_")) {
  const homeDecorType = input.replace("HOMEDECORTYPE_", "");
  return sendProducts(phone, homeDecorType);
}

if (text === "category_makeup") {
  return sendMakeupSubcategories(phone);
}

if (text.startsWith("makeuptype_")) {
  const makeupType = input.replace("MAKEUPTYPE_", "");
  return sendProducts(phone, makeupType);
}

if (text === "category_mobile phones") {
  return sendMobilePhoneSubcategories(phone);
}

if (text.startsWith("mobiletype_")) {
  const mobileType = input.replace("MOBILETYPE_", "");
  return sendProducts(phone, mobileType);
}

if (text === "category_shoes") {
  return sendShoesSubcategories(phone);
}

if (text.startsWith("shoetype_")) {
  const shoeType = input.replace("SHOETYPE_", "");
  return sendProducts(phone, shoeType);
}

if (text.startsWith("wish_")) {
  const productId = input.replace("WISH_", "");
  return addWishlist(phone, productId);
}

if (text === "wishlist" || text === "menu_wishlist") {
  return showWishlist(phone);
}

if (text.startsWith("unwish_")) {
  const productId = input.replace("UNWISH_", "");
  return removeWishlist(phone, productId);
}

if (text === "track" || text === "track order" || text === "menu_track") {
  return trackOrder(phone);
}

if (typeof input === "object" && input.type === "image") {
    return handleImageSearch(phone, input.imageId);
  }

if (text.startsWith("image_search")) {
  const caption = text.replace("image_search", "").trim();

  if (caption) {
    return handleSimpleAIChat(phone, caption);
  }

  return sendListMessage(
    phone,
    "📷 Image received!\nWhat product is this similar to?",
    "Choose Type",
    [
      { id: "CATEGORY_Bags", title: "Bags", description: "Backpacks, leather bags" },
      { id: "CATEGORY_Shoes", title: "Shoes", description: "Sneakers, sports shoes" },
      { id: "CATEGORY_Mobile Phones", title: "Mobile Phones", description: "Phones and accessories" },
      { id: "CATEGORY_Makeup", title: "Makeup", description: "Beauty products" },
      { id: "CATEGORY_Clothing", title: "Clothing", description: "Shirts, jeans, dresses" }
    ]
  );
}

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// ===================== PRODUCTS =====================
=======
async function trackOrder(phone) {
  const order = await orderService.getLatestOrder(phone);

  if (!order) {
    return sendButtonMessage(phone, "No orders found.", [
      { id: "MENU_BROWSE", title: "Shop Now" },
      { id: "MAIN_MENU", title: "Menu" }
    ]);
  }

  const tracking = order.tracking_status || "ORDER_PLACED";

  return sendButtonMessage(
    phone,
    `🚚 *Order Tracking*

🧾 Order ID: ${order.order_code}
💰 Total: ${money(order.total)}
💳 Payment: ${order.status}
📦 Status: ${tracking}

${getTrackingMessage(tracking)}`,
    [
      { id: "MENU_BROWSE", title: "Shop More" },
      { id: "MENU_CART", title: "Cart" },
      { id: "MAIN_MENU", title: "Menu" }
    ]
  );
}

function getTrackingMessage(status) {
  const messages = {
    ORDER_PLACED: "✅ Your order has been placed.",
    PAYMENT_CONFIRMED: "💳 Payment confirmed. We are preparing your order.",
    PACKED: "📦 Your order is packed.",
    SHIPPED: "🚚 Your order has been shipped.",
    OUT_FOR_DELIVERY: "🛵 Your order is out for delivery.",
    DELIVERED: "🎉 Your order has been delivered.",
    CANCELLED: "❌ Your order was cancelled."
  };

  return messages[status] || "📦 Your order is being processed.";
}

async function addWishlist(phone, productId) {
  const items = await wishlistRepository.addToWishlist(phone, productId);

  return sendButtonMessage(
    phone,
    `❤️ Added to wishlist.

Wishlist items: ${items.length}`,
    [
      { id: "MENU_WISHLIST", title: "Wishlist" },
      { id: "MENU_BROWSE", title: "Shop More" },
      { id: "MENU_CART", title: "Cart" }
    ]
  );
}

async function removeWishlist(phone, productId) {
  const items = await wishlistRepository.removeFromWishlist(phone, productId);

  return sendButtonMessage(
    phone,
    `Removed from wishlist.

Wishlist items: ${items.length}`,
    [
      { id: "MENU_WISHLIST", title: "Wishlist" },
      { id: "MENU_BROWSE", title: "Shop More" },
      { id: "MENU_CART", title: "Cart" }
    ]
  );
}

async function showWishlist(phone) {
  const items = await wishlistRepository.getWishlist(phone);

  if (!items.length) {
    return sendButtonMessage(phone, "❤️ Your wishlist is empty.", [
      { id: "MENU_BROWSE", title: "Browse" },
      { id: "MENU_CART", title: "Cart" }
    ]);
  }

  return sendListMessage(
    phone,
    "❤️ Your Wishlist\nChoose product or action:",
    "Open Wishlist",
    [
      ...items.slice(0, 8).map((item) => ({
        id: `PRODUCT_${item.id}`,
        title: item.name.slice(0, 24),
        description: `${money(item.price)} • ${item.id}`
      })),
      { id: "MENU_BROWSE", title: "Categories", description: "Shop more" },
      { id: "MENU_CART", title: "View Cart", description: "See cart" }
    ]
  );
}

async function handleSmartSearch(phone, text) {
  const smartWords = [
    "show", "find", "search", "under", "below", "less than",
    "cheap", "budget", "best", "recommend", "suggest", "want", "need"
  ];

  const isSmartSearch = smartWords.some((word) => text.includes(word));

  if (!isSmartSearch) {
    return null;
  }

  let maxPrice = null;
  let minPrice = null;

  const underMatch = text.match(/(?:under|below|less than)\s+(\d+)/);
  if (underMatch) {
    maxPrice = Number(underMatch[1]);
  }

  const aboveMatch = text.match(/(?:above|over|more than)\s+(\d+)/);
  if (aboveMatch) {
    minPrice = Number(aboveMatch[1]);
  }

  if (text.includes("cheap") || text.includes("budget") || text.includes("low price")) {
    maxPrice = maxPrice || 1500;
  }

  let category = null;
  let subcategory = null;

  const categoryMap = {
    bag: "Bags",
    bags: "Bags",
    book: "Books",
    books: "Books",
    cloth: "Clothing",
    clothes: "Clothing",
    clothing: "Clothing",
    shoe: "Shoes",
    shoes: "Shoes",
    phone: "Mobile Phones",
    mobile: "Mobile Phones",
    electronics: "Electronics",
    grocery: "Grocery",
    makeup: "Makeup",
    decor: "Home Decor",
    home: "Home Decor",
    cooking: "Cooking Utensils",
    utensil: "Cooking Utensils"
  };

  for (const key in categoryMap) {
    if (text.includes(key)) {
      category = categoryMap[key];
      break;
    }
  }

  const subcategoryMap = {
    leather: "Leather Bags",
    travel: "Travel Bags",
    backpack: "Normal Bags",
    finance: "Finance Books",
    programming: "Programming Books",
    selfhelp: "Self Help Books",
    "self help": "Self Help Books",
    cookware: "Cookware",
    kitchen: "Kitchen Tools",
    appliance: "Appliances",
    audio: "Audio Devices",
    headphone: "Audio Devices",
    speaker: "Audio Devices",
    computer: "Computer Accessories",
    gadget: "Smart Gadgets",
    rice: "Rice and Grains",
    grain: "Rice and Grains",
    dairy: "Dairy and Eggs",
    egg: "Dairy and Eggs",
    essential: "Daily Essentials",
    lighting: "Lighting Decor",
    wall: "Wall Decor",
    furnishing: "Soft Furnishing",
    face: "Face Makeup",
    eye: "Eye Makeup",
    lip: "Lip and Nail",
    nail: "Lip and Nail",
    apple: "Apple Phones",
    iphone: "Apple Phones",
    samsung: "Samsung Phones",
    motorola: "Motorola Phones",
    casual: "Casual Shoes",
    formal: "Formal Shoes",
    sports: "Sports Shoes"
  };

  for (const key in subcategoryMap) {
    if (text.includes(key)) {
      subcategory = subcategoryMap[key];
      break;
    }
  }

  let keyword = text
    .replace(/show|find|search|under|below|less than|above|over|more than|cheap|budget|best|recommend|suggest|want|need|products|product/g, "")
    .replace(/\d+/g, "")
    .trim();

  if (!keyword) keyword = null;

  const products = await productRepository.searchProducts({
    keyword,
    maxPrice,
    minPrice,
    category,
    subcategory
  });

  if (!products.length) {
    return sendButtonMessage(
      phone,
      "No matching products found. Try browsing categories.",
      [
        { id: "MENU_BROWSE", title: "Browse" },
        { id: "MENU_CART", title: "Cart" },
        { id: "MAIN_MENU", title: "Menu" }
      ]
    );
  }

  await sendWhatsAppMessage(
  phone,
  `🔍 *Smart Search Results*\n"${text}"\n📄 Items 1-${products.length} of ${products.length}`
);

for (const product of products) {
  if (product.image_url && product.image_url.startsWith("http")) {
    await sendImageMessage(phone, product.image_url, product.name);
    await delay(500);
  }

  const details = `🛍️ *${product.name}*

💰 Price: ${money(product.price)}
🆔 Product ID: ${product.id}
📂 Category: ${product.category}
🏷️ Type: ${product.clothing_type || product.clothingType || "General"}
📏 Size: ${product.size || "N/A"}
🎨 Color: ${product.color || "N/A"}

📝 ${product.description || "High quality product."}`;

  await sendWhatsAppMessage(phone, details);
  await delay(500);

  await sendButtonMessage(phone, "Choose action:", [
    { id: `ADD_${product.id}`, title: "🛒 Add" },
    { id: `PRODUCT_${product.id}`, title: "👁 Details" },
    { id: `WISH_${product.id}`, title: "❤️ Wish" }
  ]);

  await delay(700);
}

return sendButtonMessage(phone, "Need anything else?", [
  { id: "MENU_BROWSE", title: "Categories" },
  { id: "MENU_CART", title: "View Cart" },
  { id: "MENU_CHECKOUT", title: "Checkout" }
]);
}

async function sendShoesSubcategories(phone) {
  await sendListMessage(
    phone,
    "👟 Choose shoe type:",
    "Open Types",
    [
      { id: "SHOETYPE_Casual Shoes", title: "Casual Shoes", description: "Sneakers, sandals, flip-flops" },
      { id: "SHOETYPE_Formal Shoes", title: "Formal Shoes", description: "Office and formal wear" },
      { id: "SHOETYPE_Sports Shoes", title: "Sports Shoes", description: "Running, boots and sports shoes" }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendMobilePhoneSubcategories(phone) {
  await sendListMessage(
    phone,
    "📱 Choose mobile brand:",
    "Open Brands",
    [
      { id: "MOBILETYPE_Apple Phones", title: "Apple Phones", description: "iPhone models" },
      { id: "MOBILETYPE_Samsung Phones", title: "Samsung Phones", description: "Galaxy smartphones" },
      { id: "MOBILETYPE_Motorola Phones", title: "Motorola Phones", description: "Motorola smartphones" }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendMakeupSubcategories(phone) {
  await sendListMessage(
    phone,
    "💄 Choose makeup type:",
    "Open Types",
    [
      { id: "MAKEUPTYPE_Face Makeup", title: "Face Makeup", description: "Foundation, compact, kits" },
      { id: "MAKEUPTYPE_Eye Makeup", title: "Eye Makeup", description: "Eyeliner and mascara" },
      { id: "MAKEUPTYPE_Lip and Nail", title: "Lip and Nail", description: "Lipstick and nail polish" }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendHomeDecorSubcategories(phone) {
  await sendListMessage(
    phone,
    "🏠 Choose home decor type:",
    "Open Types",
    [
      {
        id: "HOMEDECORTYPE_Lighting Decor",
        title: "Lighting Decor",
        description: "Lamps and LED lights"
      },
      {
        id: "HOMEDECORTYPE_Wall Decor",
        title: "Wall Decor",
        description: "Clocks, paintings, vases"
      },
      {
        id: "HOMEDECORTYPE_Soft Furnishing",
        title: "Soft Furnishing",
        description: "Curtains and sofa covers"
      }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendGrocerySubcategories(phone) {
  await sendListMessage(
    phone,
    "🛒 Choose grocery type:",
    "Open Types",
    [
      {
        id: "GROCERYTYPE_Rice and Grains",
        title: "Rice and Grains",
        description: "Rice, atta and grains"
      },
      {
        id: "GROCERYTYPE_Dairy and Eggs",
        title: "Dairy and Eggs",
        description: "Milk, eggs and dairy"
      },
      {
        id: "GROCERYTYPE_Daily Essentials",
        title: "Daily Essentials",
        description: "Oil, sugar, tea and basics"
      }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendElectronicsSubcategories(phone) {
  await sendListMessage(
    phone,
    "⚡ Choose electronics type:",
    "Open Types",
    [
      {
        id: "ELECTYPE_Audio Devices",
        title: "Audio Devices",
        description: "Headphones, speakers, earbuds"
      },
      {
        id: "ELECTYPE_Computer Accessories",
        title: "Computer Accessories",
        description: "Keyboard, mouse, laptop accessories"
      },
      {
        id: "ELECTYPE_Smart Gadgets",
        title: "Smart Gadgets",
        description: "Smart devices and gadgets"
      }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendCookingSubcategories(phone) {
  await sendListMessage(
    phone,
    "🍳 Choose cooking utensils type:",
    "Open Types",
    [
      {
        id: "COOKTYPE_Cookware",
        title: "Cookware",
        description: "Pans, cookers, cookware sets"
      },
      {
        id: "COOKTYPE_Kitchen Tools",
        title: "Kitchen Tools",
        description: "Knives, spatulas and tools"
      },
      {
        id: "COOKTYPE_Appliances",
        title: "Appliances",
        description: "Mixer, stove and appliances"
      }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendClothingGenderOptions(phone) {
  return sendListMessage(
    phone,
    "👕 Choose clothing section:",
    "Open Clothing",
    [
      {
        id: "CLOTHGENDER_Men",
        title: "Men",
        description: "Men's clothing"
      },
      {
        id: "CLOTHGENDER_Women",
        title: "Women",
        description: "Women's clothing"
      },
      {
        id: "CLOTHGENDER_Kids",
        title: "Kids",
        description: "Kids clothing"
      },
      {
        id: "MENU_BROWSE",
        title: "Categories",
        description: "Back to categories"
      }
    ]
  );
}

async function sendClothingTypeOptions(phone, gender) {
  const types = await productRepository.getClothingTypesByGender(gender);

  if (!types.length) {
    return sendWhatsAppMessage(phone, `No ${gender} clothing found.`);
  }

  return sendListMessage(
    phone,
    `👗 Choose ${gender} clothing type:`,
    "Open Types",
    [
      ...types.map((item) => ({
        id: `CLOTHTYPE_${gender}|${item.clothing_type}`,
        title: item.clothing_type.slice(0, 24),
        description: `Browse ${item.clothing_type}`
      })),
      {
        id: "CATEGORY_Clothing",
        title: "Back",
        description: "Choose Men/Women/Kids again"
      },
      {
        id: "MENU_CART",
        title: "View Cart",
        description: "See selected items"
      }
    ]
  );
}

async function sendClothingProducts(phone, gender, clothingType) {
  const products = await productRepository.getClothingProducts(gender, clothingType);

  if (!products.length) {
    return sendListMessage(phone, "No products found. Choose another option:", "Open Menu", [
      { id: "CATEGORY_Clothing", title: "Back Clothing", description: "Choose clothing again" },
      { id: "MENU_CART", title: "View Cart", description: "See cart" },
      { id: "MENU_CHECKOUT", title: "Checkout", description: "Place order" }
    ]);
  }

  return sendListMessage(
    phone,
    `🛍️ ${gender} ${clothingType}\nChoose product or action:`,
    "Open Products",
    [
      ...products.map((product) => ({
        id: `PRODUCT_${product.id}`,
        title: product.name.slice(0, 24),
        description: `${money(product.price)} • Size ${product.size || "-"} • ${product.color || "-"}`
      })),
      { id: "CATEGORY_Clothing", title: "Back Clothing", description: "Choose another type" },
      { id: "MENU_CART", title: "View Cart", description: "See cart" },
      { id: "MENU_CHECKOUT", title: "Checkout", description: "Place order" }
    ]
  );
}

async function sendBookSubcategories(phone) {
  await sendListMessage(
    phone,
    "📚 Choose book type:",
    "Open Book Types",
    [
      {
        id: "BOOKTYPE_Self Help Books",
        title: "Self Help Books",
        description: "Habits, focus, productivity"
      },
      {
        id: "BOOKTYPE_Finance Books",
        title: "Finance Books",
        description: "Money, investing, business"
      },
      {
        id: "BOOKTYPE_Programming Books",
        title: "Programming Books",
        description: "Coding and system design"
      }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendBagSubcategories(phone) {
  await sendListMessage(
    phone,
    "🎒 Choose bag type:",
    "Open Bag Types",
    [
      {
        id: "BAGTYPE_Leather Bags",
        title: "Leather Bags",
        description: "Premium office and fashion bags"
      },
      {
        id: "BAGTYPE_Normal Bags",
        title: "Normal Bags",
        description: "Daily use backpacks and sling bags"
      },
      {
        id: "BAGTYPE_Travel Bags",
        title: "Travel Bags",
        description: "Travel backpacks and trolley bags"
      }
    ]
  );

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function sendMainMenu(phone) {
  await sendWhatsAppMessage(
    phone,
    `👋 Welcome to *ShopBot*!

For any queries or issues, contact us:

📧 Email: 123xchatbot@gmail.com
📞 Phone: +91 1234567890`
  );

  return sendListMessage(
    phone,
    `👋 Welcome to ShopBot.

Choose an option:`,
    "Open Menu",
    [
      { id: "MENU_BROWSE", title: "Browse Products", description: "Shop by categories" },
      { id: "MENU_CART", title: "View Cart", description: "See selected items" },
      { id: "MENU_CHECKOUT", title: "Checkout", description: "Place order" },
      { id: "MENU_WISHLIST", title: "Wishlist", description: "View saved products" },
      { id: "MENU_TRACK", title: "Track Order", description: "Check latest order status" }
    ]
  );
}

async function sendPersonalizedProducts(phone, category, subcategory) {
  await userPreferenceRepository.addPreference(phone, category, subcategory);

  const preference = await userPreferenceRepository.getTopPreference(
    phone,
    category,
    subcategory
  );

  const products = await productRepository.getPersonalizedProducts(
    preference.category,
    preference.subcategory,
    3
  );

  if (!products.length) {
    return sendWhatsAppMessage(phone, "No recommended products found.");
  }

  for (const product of products) {
    if (product.image_url && product.image_url.startsWith("http")) {
      await sendImageMessage(phone, product.image_url, product.name);
      await delay(500);
    }

    const details = `🛍️ *${product.name}*

💰 Price: ${money(product.price)}
🆔 Product ID: ${product.id}
📂 Category: ${product.category}
🏷️ Type: ${product.clothing_type || product.clothingType || "General"}

📝 ${product.description || "High quality product."}`;

    await sendWhatsAppMessage(phone, details);
    await delay(500);

    await sendButtonMessage(phone, "Choose action:", [
      { id: `ADD_${product.id}`, title: "🛒 Add" },
      { id: `PRODUCT_${product.id}`, title: "👁 Details" },
      { id: `WISH_${product.id}`, title: "❤️ Wish" }
    ]);

    await delay(700);
  }

  return sendButtonMessage(phone, "Need anything else?", [
    { id: "MENU_BROWSE", title: "Categories" },
    { id: "MENU_CART", title: "View Cart" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}


>>>>>>> Stashed changes
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

