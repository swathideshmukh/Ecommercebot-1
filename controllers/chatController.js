const productRepository = require("../repositories/productRepository");
const cartService = require("../services/cartService");
const orderService = require("../services/orderService");
const wishlistRepository = require("../repositories/wishlistRepository");
const User = require("../db/models/User");
const fetch = require("node-fetch");
const userPreferenceRepository = require("../repositories/userPreferenceRepository");
const { analyzeImage } = require("../services/imageAIService");
const { generateInvoice } = require("../services/invoiceService");
const processedMessages = new Set();

const {
  sendWhatsAppMessage,
  sendButtonMessage,
  sendImageMessage,
  sendListMessage,
  sendDocumentMessage
} = require("../services/whatsappService");

const {
  money,
  formatProduct,
  formatCart,
  formatOrder
} = require("../utils/formatters");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleIncomingMessage(req, res) {
  try {
    const message = extractMessage(req.body);

    if (!message) {
      return res.sendStatus(200);
    }

    if (processedMessages.has(message.id)) {
      return res.sendStatus(200);
    }

    processedMessages.add(message.id);

    setTimeout(() => {
      processedMessages.delete(message.id);
    }, 10 * 60 * 1000);

    const from = message.from;
    const input = getMessageInput(message);
    await User.findOneAndUpdate(
  { phone: from },
  {
    phone: from,
    lastActiveAt: new Date(),
    reminderSentAt: null
  },
  { upsert: true, returnDocument: "after" }
);

    console.log(`[MESSAGE] ${from}: ${input}`);

    await routeMessage(from, input);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Chat controller error:", error);
    return res.sendStatus(200);
  }
}
function extractMessage(body) {
  return body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
}

function getMessageInput(message) {
  if (message.type === "text") {
    return message.text.body.trim();
  }

  if (message.type === "image") {
  return {
    type: "image",
    imageId: message.image.id
  };
}

  if (message.type === "interactive") {
    if (message.interactive.type === "button_reply") {
      return message.interactive.button_reply.id;
    }

    if (message.interactive.type === "list_reply") {
      return message.interactive.list_reply.id;
    }
  }

  return "";
}

async function routeMessage(phone, input) {
  if (typeof input === "object" && input.type === "image") {
    return handleImageSearch(phone, input.imageId);
  }
  const text = input.toLowerCase();

  const checkoutUser = await User.findOne({ phone });

if (checkoutUser?.checkoutStep === "WAITING_ADDRESS" && text.length > 10) {
  checkoutUser.address = input;
  checkoutUser.checkoutStep = null;
  await checkoutUser.save();

  await sendWhatsAppMessage(phone, "✅ Address saved!");
  return askReferralBeforeCheckout(phone);
}

if (checkoutUser?.checkoutStep === "WAITING_REFERRAL_CODE") {

  if (text === "skip" || text === "skip_referral") {
    checkoutUser.appliedReferralCode = null;
    checkoutUser.checkoutStep = null;
    await checkoutUser.save();

    return checkout(phone);
  }

  if (text === "my code" || text === "mycode" || text === "referral code") {
    await showMyReferralCode(phone);

    return sendWhatsAppMessage(
      phone,
      "Now enter your friend's referral code, or type *skip* to continue without discount."
    );
  }

  if (text === "menu" || text === "main_menu" || text === "hi" || text === "hello") {
    checkoutUser.checkoutStep = null;
    await checkoutUser.save();

    return sendMainMenu(phone);
  }

  return applyReferralCodeAndCheckout(phone, input.trim().toUpperCase());
}

  if (["hi", "hello", "hey", "menu", "start", "main_menu"].includes(text)) {
    return sendMainMenu(phone);
  }

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

  if (text.startsWith("category_")) {
    const category = input.replace("CATEGORY_", "");
    return sendProducts(phone, category);
  }

  if (text.startsWith("add_")) {
    const productId = input.replace("ADD_", "");
    return addProduct(phone, productId);
  }

  if (text === "menu_cart" || text === "cart" || text.includes("view cart")) {
    return sendCart(phone);
  }

  if (text === "my code" || text === "referral code") {
  return showMyReferralCode(phone);
}

if (text.startsWith("apply code ")) {
  const code = input.replace(/apply code/i, "").trim().toUpperCase();
  return applyReferralCode(phone, code);
}

  if (text === "menu_checkout" || text === "checkout") {
  return askAddressBeforeCheckout(phone);
}

if (text === "apply_referral") {
  const user = await User.findOne({ phone });
  user.checkoutStep = "WAITING_REFERRAL_CODE";
  await user.save();

  return sendWhatsAppMessage(phone, "🎁 Enter referral code now:");
}

if (text === "skip_referral") {
  const user = await User.findOne({ phone });
  user.appliedReferralCode = null;
  await user.save();

  return checkout(phone);
}

  if (text === "menu_browse" || text.includes("browse products")) {
    return sendCategories(phone);
  }

  if (text.startsWith("add ")) {
  const parts = input.split(" ");
  return addProduct(phone, parts[1], parts[2] || 1);
}

if (text.startsWith("remove ")) {
  const parts = input.split(" ");
  return removeProduct(phone, parts[1], parts[2] || 1);
}
  const maybeProduct = await productRepository.getProductById(input);

if (maybeProduct) {
  return sendProduct(phone, maybeProduct.id);
}

const searchResult = await handleSmartSearch(phone, text);
if (searchResult) {
  return searchResult;
}

const allCategories = await productRepository.getCategories();

for (const category of allCategories) {
  const categoryName = category.name.toLowerCase();

  if (
    text.includes(categoryName) ||
    text.includes(categoryName.replace(/\s+/g, "")) ||
    text.includes(categoryName.split(" ")[0])
  ) {
    return sendProducts(phone, category.name);
  }
}

// 📍 Capture address if not set
const user = await User.findOne({ phone });

if (user && !user.address && text.length > 10) {
  user.address = input;
  await user.save();

  await sendWhatsAppMessage(phone, "✅ Address saved!");

  return checkout(phone);
}


  const aiResult = await handleSimpleAIChat(phone, text);
  if (aiResult) {
    return aiResult;
}

  return sendWhatsAppMessage(
  phone,
  `👋 Hey there! Welcome to ShopBot 🛍️

To begin your shopping journey, just type *hi*.

I’ll guide you with categories, cart, and checkout options 🚀`
);
}

async function askAddressBeforeCheckout(phone) {
  const user = await User.findOne({ phone });

  if (!user.address) {
    user.checkoutStep = "WAITING_ADDRESS";
    await user.save();

    return sendWhatsAppMessage(
      phone,
      "📍 Please enter your delivery address:\n\nExample:\nHouse No, Street, City, Pincode"
    );
  }

  return askReferralBeforeCheckout(phone);
}

async function getImageDataUrl(mediaId) {
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      }
    });

    const meta = await metaRes.json();

    if (!meta.url) {
      console.error("Media meta error:", meta);
      return null;
    }

    const imgRes = await fetch(meta.url, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      }
    });

    const buffer = await imgRes.buffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";

    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("Image download error:", err);
    return null;
  }
}

async function sendCategories(phone) {
  const categories = await productRepository.getCategories();

  return sendListMessage(
    phone,
    "🛍️ Choose category or action:",
    "Open Menu",
    [
      ...categories.map((category) => ({
        id: `CATEGORY_${category.name}`,
        title: category.name,
        description: `Browse ${category.name}`
      })),
      { id: "MENU_CART", title: "View Cart", description: "See cart items" },
      { id: "MENU_CHECKOUT", title: "Checkout", description: "Place order" },
      { id: "MAIN_MENU", title: "Main Menu", description: "Go back" }
    ]
  );
}

async function showMyReferralCode(phone) {
  const user = await User.findOneAndUpdate(
    { phone },
    { phone },
    { upsert: true, returnDocument: "after" }
  );

  return sendWhatsAppMessage(
    phone,
    `🎁 *Your Referral Code*

Code: *${user.referralCode}*

Share this code with your friends.
If they use it during checkout, they get *20% discount*.`
  );
}

async function applyReferralCode(phone, code) {
  const user = await User.findOne({ phone });

  if (!user) {
    return sendWhatsAppMessage(phone, "Please type menu first, then apply code.");
  }

  if (user.referralCode === code) {
    return sendWhatsAppMessage(phone, "You cannot use your own referral code.");
  }

  const referrer = await User.findOne({ referralCode: code });

  if (!referrer) {
    return sendWhatsAppMessage(phone, "Invalid referral code.");
  }

  user.appliedReferralCode = code;
  await user.save();

  return sendButtonMessage(
    phone,
    `✅ Referral code applied!

You will get *20% discount* on checkout.`,
    [
      { id: "MENU_CART", title: "View Cart" },
      { id: "MENU_CHECKOUT", title: "Checkout" },
      { id: "MENU_BROWSE", title: "Shop More" }
    ]
  );
}

async function handleImageSearch(phone, imageId) {
  await sendWhatsAppMessage(phone, "🔍 Analyzing your image...");

  const imageUrl = await getImageDataUrl(imageId);

  if (!imageUrl) {
    return sendWhatsAppMessage(phone, "Failed to read image.");
  }

  const aiResult = await analyzeImage(imageUrl);

  if (!aiResult) {
    return sendWhatsAppMessage(phone, "Could not understand image.");
  }

  await sendWhatsAppMessage(phone, `🤖 Detected: ${aiResult}`);

  const products = await productRepository.searchProducts({
    keyword: aiResult
  });

  if (!products.length) {
    return sendWhatsAppMessage(phone, "No similar products found.");
  }

  return sendListMessage(
    phone,
    `🛍️ Products similar to your image`,
    "View Products",
    products.slice(0, 7).map((p) => ({
      id: `PRODUCT_${p.id}`,
      title: p.name.slice(0, 24),
      description: `${money(p.price)} • ${p.category}`
    }))
  );
}

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


async function sendProducts(phone, category) {
  const products = await productRepository.getProductsByCategoryName(category);

  if (!products.length) {
    return sendWhatsAppMessage(phone, "No products found.");
  }

  await sendWhatsAppMessage(
    phone,
    `🛒 *${category}*\n📄 Items 1-${products.length} of ${products.length}`
  );

  for (const product of products) {
    console.log("PRODUCT IMAGE:", product.id, product.image_url);

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
async function sendProduct(phone, productId) {
  const product = await productRepository.getProductById(productId);

  if (!product) {
    return sendWhatsAppMessage(phone, "Product not found.");
  }

  const caption = `🛍️ *${product.name}*

💰 Price: ${money(product.price)}
📦 Category: ${product.category}
${product.gender ? `👤 Section: ${product.gender}` : ""}
${product.clothing_type ? `👕 Type: ${product.clothing_type}` : ""}
${product.size ? `📏 Size: ${product.size}` : ""}
${product.color ? `🎨 Color: ${product.color}` : ""}

📝 ${product.description || "High quality product."}

🆔 Product ID: ${product.id}`;

  if (product.image_url && product.image_url.startsWith("http")) {
    await sendImageMessage(phone, product.image_url, caption);
  } else {
    await sendWhatsAppMessage(phone, caption);
  }

  return sendButtonMessage(phone, "Choose next action:", [
    { id: `ADD_${product.id}`, title: "Add to Cart" },
    { id: `CATEGORY_${product.category}`, title: "Other Products" },
    { id: `WISH_${product.id}`, title: "Wishlist" },
    { id: "MENU_CHECKOUT", title: "Checkout" }
  ]);
}

async function addProduct(phone, productId, quantity = 1) {
  const cart = await cartService.addToCart(phone, productId, quantity);

  if (!cart) {
    return sendWhatsAppMessage(phone, "Product not found.");
  }

  return sendButtonMessage(
    phone,
    `✅ Added ${quantity} item(s) to cart.\n\n${formatCart(cart)}`,
    [
      { id: "MENU_BROWSE", title: "Shop More" },
      { id: "MENU_CART", title: "View Cart" },
      { id: "MENU_CHECKOUT", title: "Checkout" }
    ]
  );
}

async function removeProduct(phone, productId, quantity = 1) {
  const cart = await cartService.removeFromCart(phone, productId, quantity);

  return sendButtonMessage(
    phone,
    `✅ Removed ${quantity} item(s).\n\n${formatCart(cart)}`,
    [
      { id: "MENU_BROWSE", title: "Shop More" },
      { id: "MENU_CHECKOUT", title: "Checkout" },
      { id: "MAIN_MENU", title: "Menu" }
    ]
  );
}

async function sendCart(phone) {
  const cart = await cartService.getCart(phone);

  return sendButtonMessage(phone, formatCart(cart), [
    { id: "MENU_BROWSE", title: "Shop More" },
    { id: "MENU_CHECKOUT", title: "Checkout" },
    { id: "MAIN_MENU", title: "Menu" }
  ]);
}

async function askReferralBeforeCheckout(phone) {
  return sendButtonMessage(
    phone,
    "🎁 Do you have a referral/coupon code?",
    [
      { id: "APPLY_REFERRAL", title: "Apply Code" },
      { id: "SKIP_REFERRAL", title: "Skip" },
      { id: "MENU_CART", title: "View Cart" }
    ]
  );
}

async function applyReferralCodeAndCheckout(phone, code) {
  const user = await User.findOne({ phone });

  if (user.referralCode === code) {
    user.checkoutStep = null;
    await user.save();
    return sendWhatsAppMessage(phone, "You cannot use your own referral code.");
  }

  const referrer = await User.findOne({ referralCode: code });

  if (!referrer) {
    return sendWhatsAppMessage(phone, "Invalid code. Send a valid code or type skip.");
  }

  user.appliedReferralCode = code;
  user.checkoutStep = null;
  await user.save();

  await sendWhatsAppMessage(phone, "✅ Referral code applied! You got 20% discount.");

  return checkout(phone);
}

async function checkout(phone) {
  const order = await orderService.checkout(phone);

  if (!order) {
    return sendButtonMessage(phone, "Your cart is empty.", [
      { id: "MENU_BROWSE", title: "Browse Products" },
      { id: "MAIN_MENU", title: "Menu" }
    ]);
  }

  // Step 1: Send payment link
  await sendWhatsAppMessage(
    phone,
    `✅ Order created!

Subtotal: ${money(order.subtotal || order.total)}
Discount: ${money(order.discount || 0)}
💰 Payable Total: ${money(order.total)}

📍 Address:
${order.address || "Address not provided"}

🔗 Pay here:
${order.paymentLink}

🧾 Invoice will be sent shortly...`
  );

  // Step 2: Wait 30 seconds
  setTimeout(async () => {
    try {
      console.log("⏳ Generating delayed invoice...");

      const fileName = await generateInvoice({
        orderCode: order.orderCode,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        address: order.address,
        status: "PLACED",
        items: order.items || []
      });

      await sendDocumentMessage(
  phone,
  `${process.env.BASE_URL}/invoices/${fileName}`,
  fileName,
  "🧾 Your ShopBot invoice"
);

// 🔥 ADD THIS BELOW
await sendWhatsAppMessage(
  phone,
  `🧾 Invoice link:\n${process.env.BASE_URL}/invoices/${fileName}`
);

      console.log("✅ Invoice sent :", fileName);

    } catch (err) {
      console.error("❌ Invoice delay error:", err);
    }
  }, 50000); // 50 seconds delay

  return;
}

async function sendMoreProducts(phone, category) {
  const products = await productRepository.getProductsByCategoryName(category);

  for (const product of products.slice(3, 7)) {
    const caption = `*${product.name}*
💰 Price: ${money(product.price)}

${product.description || "High quality product."}

🆔 ${product.id}`;

    if (product.image_url && product.image_url.startsWith("http")) {
      await sendImageMessage(phone, product.image_url, caption);
    } else {
      await sendWhatsAppMessage(phone, caption);
    }

    await delay(700);

    await sendButtonMessage(phone, "Choose:", [
      { id: `ADD_${product.id}`, title: "Add to Cart" },
      { id: `PRODUCT_${product.id}`, title: "Details" },
      { id: "MENU_CART", title: "Cart" }
    ]);

    await delay(700);
  }
}

async function handleSimpleAIChat(phone, text) {
  let keyword = null;
  let maxPrice = null;

  if (text.includes("gift")) {
    maxPrice = 1000;
  }

  if (text.includes("cheap") || text.includes("budget") || text.includes("low price")) {
    maxPrice = maxPrice || 1500;
  }

  if (text.includes("shoe")) keyword = "shoes";
  else if (text.includes("bag")) keyword = "bags";
  else if (text.includes("phone") || text.includes("mobile")) keyword = "phone";
  else if (text.includes("makeup") || text.includes("lipstick")) keyword = "makeup";
  else if (text.includes("book")) keyword = "book";
  else if (text.includes("watch")) keyword = "watch";
  else if (text.includes("grocery") || text.includes("rice") || text.includes("milk")) keyword = "grocery";
  else if (text.includes("home") || text.includes("decor")) keyword = "decor";
  else if (text.includes("cloth") || text.includes("shirt") || text.includes("jeans")) keyword = "clothing";

  const aiWords = ["suggest", "recommend", "best", "want", "need", "show me", "looking for"];

  const isAIQuery = aiWords.some((word) => text.includes(word));

  if (!isAIQuery && !keyword && !maxPrice) {
    return null;
  }

  const products = await productRepository.searchProducts({
    keyword,
    maxPrice
  });

  if (!products.length) {
    return sendButtonMessage(
      phone,
      "I couldn't find matching products. Try browsing categories.",
      [
        { id: "MENU_BROWSE", title: "Browse" },
        { id: "MENU_WISHLIST", title: "Wishlist" },
        { id: "MENU_CART", title: "Cart" }
      ]
    );
  }

  return sendListMessage(
    phone,
    `🤖 I found some products for you:\n"${text}"`,
    "View Suggestions",
    [
      ...products.slice(0, 7).map((product) => ({
        id: `PRODUCT_${product.id}`,
        title: product.name.slice(0, 24),
        description: `${money(product.price)} • ${product.category}`
      })),
      { id: "MENU_BROWSE", title: "Categories", description: "Browse more" },
      { id: "MENU_CART", title: "Cart", description: "View cart" },
      { id: "MENU_WISHLIST", title: "Wishlist", description: "Saved products" }
    ]
  );
}

module.exports = {
  handleIncomingMessage
};