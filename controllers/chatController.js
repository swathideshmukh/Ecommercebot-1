 const productRepository = require("../repositories/productRepository");
const cartService = require("../services/cartService");
const orderService = require("../services/orderService");
const recommendationService = require("../services/recommendationService");
const recommendationRepository = require("../repositories/recommendationRepository");

const processedMessages = new Set();
const userSelections = {}; // phone -> { productId, productName, size, color, quantity, step }

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
    const message = extractMessage(req.body);
    if (!message) return res.sendStatus(200);

    if (processedMessages.has(message.id)) {
      return res.sendStatus(200);
    }

    processedMessages.add(message.id);
    setTimeout(() => processedMessages.delete(message.id), 10 * 60 * 1000);

    const from = message.from;
    const input = getMessageInput(message);

    console.log(`[MESSAGE] ${from}: ${input}`);

    await routeMessage(from, input);
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(200);
  }
}

// ===================== HELPERS =====================
function extractMessage(body) {
  return body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
}

function getMessageInput(message) {
  if (message.type === "text") return message.text.body.trim();

  if (message.type === "interactive") {
    if (message.interactive.type === "button_reply")
      return message.interactive.button_reply.id;

    if (message.interactive.type === "list_reply")
      return message.interactive.list_reply.id;
  }

  return "";
}

// ===================== NATURAL LANGUAGE PARSER =====================
// Supported categories
const supportedCategories = [
  "shoes", "bags", "clothing", "electronics", "mobile phones", "watches",
  "makeup", "grocery", "books", "cooking utensils", "home decor"
];

// Parse natural language price queries
function parseNaturalLanguageQuery(input) {
  const lower = input.toLowerCase();
  
  // Find category
  let category = null;
  for (const cat of supportedCategories) {
    if (lower.includes(cat)) {
      category = cat.charAt(0).toUpperCase() + cat.slice(1);
      // Map singular to actual category name
      if (cat === "mobile phones") category = "Mobile Phones";
      if (cat === "cooking utensils") category = "Cooking Utensils";
      if (cat === "home decor") category = "Home Decor";
      break;
    }
  }

  if (!category) return null;

  const filters = {};
  let maxPrice = null;
  let minPrice = null;

  // Parse "under X", "below X", "less than X", "under ₹X", "upto X", "within X"
  const underPatterns = [
    /under\s*₹?(\d+(?:k)?)/i,
    /below\s*₹?(\d+(?:k)?)/i,
    /less\s+than\s*₹?(\d+(?:k)?)/i,
    /upto\s*₹?(\d+(?:k)?)/i,
    /within\s*₹?(\d+(?:k)?)/i
  ];

  for (const pattern of underPatterns) {
    const match = lower.match(pattern);
    if (match) {
      let val = match[1];
      if (val.toLowerCase().endsWith("k")) {
        maxPrice = parseInt(val.slice(0, -1)) * 1000;
      } else {
        maxPrice = parseInt(val);
      }
      break;
    }
  }

  // Parse "above X", "over X", "more than X"
  const abovePatterns = [
    /above\s*₹?(\d+(?:k)?)/i,
    /over\s*₹?(\d+(?:k)?)/i,
    /more\s+than\s*₹?(\d+(?:k)?)/i
  ];

  for (const pattern of abovePatterns) {
    const match = lower.match(pattern);
    if (match) {
      let val = match[1];
      if (val.toLowerCase().endsWith("k")) {
        minPrice = parseInt(val.slice(0, -1)) * 1000;
      } else {
        minPrice = parseInt(val);
      }
      break;
    }
  }

  // Parse "between X and Y" or "X to Y"
  const rangePatterns = [
    /between\s*₹?(\d+(?:k)?)\s+(?:and|to)\s*₹?(\d+(?:k)?)/i,
    /(\d+(?:k)?)\s+to\s*₹?(\d+(?:k)?)/i
  ];

  for (const pattern of rangePatterns) {
    const match = lower.match(pattern);
    if (match) {
      let minVal = match[1];
      let maxVal = match[2];
      
      if (minVal.toLowerCase().endsWith("k")) {
        minPrice = parseInt(minVal.slice(0, -1)) * 1000;
      } else {
        minPrice = parseInt(minVal);
      }
      
      if (maxVal.toLowerCase().endsWith("k")) {
        maxPrice = parseInt(maxVal.slice(0, -1)) * 1000;
      } else {
        maxPrice = parseInt(maxVal);
      }
      break;
    }
  }

  if (maxPrice) filters.maxPrice = maxPrice;
  if (minPrice) filters.minPrice = minPrice;

  return { category, filters };
}

// ===================== ROUTER =====================
async function routeMessage(phone, input) {
  const text = input.toLowerCase();

  // ====== NATURAL LANGUAGE QUERY CHECK ======
  const parsed = parseNaturalLanguageQuery(input);
  if (parsed) {
    const { category, filters } = parsed;
    const allProducts = await productRepository.getProductsByCategoryName(category, filters);
    
    if (!allProducts.length && filters.maxPrice) {
      // No filtered results - show unfiltered with message
      const unfilteredProducts = await productRepository.getProductsByCategoryName(category);
      if (unfilteredProducts.length) {
        const priceMsg = filters.minPrice 
          ? `between ₹${filters.minPrice} and ₹${filters.maxPrice}`
          : `under ₹${filters.maxPrice}`;
        await sendWhatsAppMessage(phone, `😕 No ${category} found ${priceMsg}. Here are all ${category} instead:`);
        // Show first page of unfiltered
        return sendProductsWithList(phone, category, unfilteredProducts, 0);
      }
    }
    
    if (allProducts.length) {
      return sendProductsWithList(phone, category, allProducts, 0);
    }
  }

  // ====== CHECK ACTIVE CLOTHING FLOW FIRST ======
  const clothingSelection = userSelections[phone];

if (clothingSelection && clothingSelection.step === "pick_options") {
    // Handle SIZE selection
    if (text.startsWith("sizeopt_")) {
      const size = text.replace("sizeopt_", "").toUpperCase();
      clothingSelection.size = size;
      await sendColorPickerForClothing(phone, clothingSelection);
      return;
    }
    // Handle COLOR selection
    if (text.startsWith("coloropt_")) {
      const color = input.replace("COLOROPT_", "");
      clothingSelection.color = color;
      await sendQtyPickerWithButtons(phone, clothingSelection);
      return;
    }
    // Handle QTY buttons
    if (text.startsWith("qtymin_")) {
      if (clothingSelection.quantity > 1) clothingSelection.quantity--;
      await sendQtyPickerWithButtons(phone, clothingSelection);
      return;
    }
    if (text.startsWith("qtyplus_")) {
      clothingSelection.quantity++;
      await sendQtyPickerWithButtons(phone, clothingSelection);
      return;
    }
// Handle CONFIRM
    if (text.startsWith("confirmcart_")) {
      await cartService.addToCart(phone, clothingSelection.productId, {
        size: clothingSelection.size,
        color: clothingSelection.color,
        quantity: clothingSelection.quantity
      });
      const cart = await cartService.getCart(phone);
      const productName = clothingSelection.productName || "Item";
      delete userSelections[phone];
      return sendButtonMessage(phone, `✅ *${productName}* added to cart!\n\n📏 Size: ${clothingSelection.size}\n🎨 Color: ${clothingSelection.color}\n🔢 Qty: ${clothingSelection.quantity}\n\n${formatCart(cart)}`, [
        { id: "MENU_BROWSE", title: "🛍️ Shop More" },
        { id: "MENU_CART", title: "🛒 View Cart" },
        { id: "MENU_CHECKOUT", title: "💳 Checkout" }
      ]);
    }
    // Cancel flow
    if (text === "cancel") {
      delete userSelections[phone];
      return sendWhatsAppMessage(phone, "❌ Cancelled. Type *menu* to browse.");
    }
  }

  // ====== MAIN MENU ======
  if (["hi", "hello", "menu", "start", "main_menu"].includes(text)) {
    delete userSelections[phone];
    return sendMainMenu(phone);
  }

  // ====== PAGINATION ======
  if (input.startsWith("VIEWMORE__")) {
    const rest = input.substring(10);
    const lastSep = rest.lastIndexOf("__");
    const category = rest.substring(0, lastSep);
    const page = parseInt(rest.substring(lastSep + 2)) || 0;
    return sendProducts(phone, category, page);
  }

  if (input.startsWith("VIEWMORECLOTH__")) {
    const rest = input.substring(15);
    const lastSep = rest.lastIndexOf("__");
    const value = rest.substring(0, lastSep);
    const page = parseInt(rest.substring(lastSep + 2)) || 0;
    const [gender, type] = value.split("|");
    return sendClothingProducts(phone, gender, type, page);
  }

  // ====== CATEGORY HANDLING ======
  if (text.startsWith("category_")) {
    const category = input.replace("CATEGORY_", "");
    return sendProducts(phone, category);
  }

  // Subcategory mappings
  if (text.startsWith("mobiletype_")) return sendProducts(phone, "Mobile Phones");
  if (text.startsWith("electype_")) return sendProducts(phone, "Electronics");
  if (text.startsWith("cooktype_")) return sendProducts(phone, "Cooking Utensils");
  if (text.startsWith("grocerytype_")) return sendProducts(phone, "Grocery");
  if (text.startsWith("homedecortype_")) return sendProducts(phone, "Home Decor");
  if (text.startsWith("makeuptype_")) return sendProducts(phone, "Makeup");
  if (text.startsWith("bagtype_")) return sendProducts(phone, "Bags");
  if (text.startsWith("booktype_")) return sendProducts(phone, "Books");
  if (text.startsWith("shoetype_")) return sendProducts(phone, "Shoes");

  // ====== CLOTHING ======
  if (text.startsWith("clothgender_")) {
    const gender = input.replace("CLOTHGENDER_", "");
    return sendClothingTypes(phone, gender);
  }

  if (text.startsWith("clothtype_")) {
    const [gender, type] = input.replace("CLOTHTYPE_", "").split("|");
    return sendClothingProducts(phone, gender, type);
  }

  // ====== PRODUCT ======
  if (text.startsWith("product_")) {
    const id = input.replace("PRODUCT_", "");
    return sendProductDetail(phone, id);
  }

  // ====== CART ACTIONS ======
  if (text.startsWith("add_")) {
    const productId = input.replace("ADD_", "");
    return handleAddToCart(phone, productId);
  }

if (text === "menu_cart") return sendCart(phone);
  if (text === "menu_checkout") return checkout(phone);
  if (text === "menu_browse") return sendCategories(phone);

  // ====== ADDRESS COLLECTION ======
  const addressSelection = userSelections[phone];
  if (addressSelection && addressSelection.step === "collect_address") {
    const address = input.trim();
    if (address.length > 10) {
      const order = await orderService.checkout(phone, address);
      delete userSelections[phone];
      return sendWhatsAppMessage(phone, `✅ *Order Placed!*\n\n📦 Address: ${address}\n💰 Total: ${money(order.total)}\n\n🔗 Pay here:\n${order.paymentLink}\n\nThank you! 🙏`);
    } else {
      return sendWhatsAppMessage(phone, "📝 Address too short. Please send a complete delivery address.");
    }
  }

  // ====== FALLBACK ======
  return sendMainMenu(phone);
}

// ===================== MENU =====================
async function sendMainMenu(phone) {
  delete userSelections[phone];
  return sendButtonMessage(phone, "👋 Welcome to *ShopBot!*\n\nBrowse products, view your cart, or checkout.", [
    { id: "MENU_BROWSE", title: "🛍️ Browse" },
    { id: "MENU_CART", title: "🛒 Cart" },
    { id: "MENU_CHECKOUT", title: "💳 Checkout" }
  ]);
}

// ===================== CATEGORIES =====================
async function sendCategories(phone) {
  const categories = await productRepository.getCategories();

  return sendListMessage(
    phone,
    "Choose a category:",
    "Browse",
    [
      ...categories.map(c => ({
        id: `CATEGORY_${c.name}`,
        title: c.name,
        description: `Browse ${c.name}`
      })),
      { id: "MENU_CART", title: "View Cart", description: "See your items" }
    ]
  );
}

// ===================== PRODUCTS (CATALOG) =====================
async function sendProducts(phone, category, page = 0) {
  const allProducts = await productRepository.getProductsByCategoryName(category);

  if (!allProducts.length) {
    return sendWhatsAppMessage(phone, "😕 No products found in this category.");
  }

  return sendProductsWithList(phone, category, allProducts, page);
}

// Helper to display products with pre-fetched list
async function sendProductsWithList(phone, category, allProducts, page = 0) {
  if (!allProducts.length) {
    return sendWhatsAppMessage(phone, "😕 No products found in this category.");
  }

  const pageSize = 3;
  const start = page * pageSize;
  const end = start + pageSize;
  const products = allProducts.slice(start, end);
  const hasMore = end < allProducts.length;
  const total = allProducts.length;

  await sendWhatsAppMessage(phone, `🛒 *${category}*\n📄 Page ${page + 1} — Items ${start + 1}-${Math.min(end, total)} of ${total}`);
  await delay(300);

  for (const p of products) {
    const caption = `*${p.name}*\n💰 ${money(p.price)}\n🆔 ${p.id}\n${p.description || "High quality product."}`;

    if (p.image_url && p.image_url.startsWith("http")) {
      await sendImageMessage(phone, p.image_url, caption);
    } else {
      await sendWhatsAppMessage(phone, caption);
    }
    await delay(300);

    await sendButtonMessage(phone, "Choose action:", [
      { id: `ADD_${p.id}`, title: "🛒 Add" },
      { id: `PRODUCT_${p.id}`, title: "👁️ Details" }
    ]);
    await delay(500);
  }

  const buttons = [];
  if (hasMore) {
    buttons.push({ id: `VIEWMORE__${category}__${page + 1}`, title: "📄 View More" });
  }
  buttons.push(
    { id: "MENU_BROWSE", title: "🏠 Categories" },
    { id: "MENU_CART", title: "🛒 Cart" }
  );

  return sendButtonMessage(phone, "What next?", buttons);
}

// ===================== PRODUCT DETAIL =====================
async function sendProductDetail(phone, id) {
  const p = await productRepository.getProductById(id);
  if (!p) return sendWhatsAppMessage(phone, "😕 Product not found.");

  const caption = `🛍️ *${p.name}*\n\n💰 ${money(p.price)}\n📦 Category: ${p.category}${p.gender ? `\n👤 Section: ${p.gender}` : ""}${p.clothing_type ? `\n👕 Type: ${p.clothing_type}` : ""}${p.size ? `\n📏 Size: ${p.size}` : ""}${p.color ? `\n🎨 Color: ${p.color}` : ""}\n\n📝 ${p.description || "High quality product."}\n\n🆔 ${p.id}`;

  if (p.image_url && p.image_url.startsWith("http")) {
    await sendImageMessage(phone, p.image_url, caption);
  } else {
    await sendWhatsAppMessage(phone, caption);
  }

  return sendButtonMessage(phone, "Choose action:", [
    { id: `ADD_${p.id}`, title: "🛒 Add to Cart" },
    { id: "MENU_BROWSE", title: "🏠 Categories" },
    { id: "MENU_CART", title: "🛒 View Cart" }
  ]);
}

// ===================== ADD TO CART =====================
async function handleAddToCart(phone, productId) {
  const product = await productRepository.getProductById(productId);
  if (!product) return sendWhatsAppMessage(phone, "😕 Product not found.");

  // Clothing: one-shot picker flow
  if (product.category === "Clothing") {
    userSelections[phone] = {
      productId,
      productName: product.name,
      size: null,
      color: null,
      quantity: 1,
      step: "pick_options"
    };
    return sendSizePickerForClothing(phone, userSelections[phone]);
  }

  // Non-clothing: direct add
  const cart = await cartService.addToCart(phone, productId);
  return sendButtonMessage(phone, `✅ *${product.name}* added!\n\n${formatCart(cart)}`, [
    { id: "MENU_BROWSE", title: "🛍️ Shop More" },
    { id: "MENU_CART", title: "🛒 View Cart" },
    { id: "MENU_CHECKOUT", title: "💳 Checkout" }
  ]);
}

// ===================== CLOTHING PICKER =====================
function getColorOptions(productName) {
  return [
    { id: "COLOROPT_Black", title: "Black", description: productName },
    { id: "COLOROPT_White", title: "White", description: productName },
    { id: "COLOROPT_Blue", title: "Blue", description: productName },
    { id: "COLOROPT_Red", title: "Red", description: productName },
    { id: "COLOROPT_Green", title: "Green", description: productName },
    { id: "COLOROPT_Grey", title: "Grey", description: productName },
    { id: "COLOROPT_Navy", title: "Navy", description: productName },
    { id: "COLOROPT_Multicolor", title: "Multicolor", description: productName }
  ];
}

async function sendSizePickerForClothing(phone, sel) {
  return sendListMessage(
    phone,
    `👕 *${sel.productName}*\n\n📏 Pick your size:`,
    "Choose Size",
    [
      { id: "SIZEOPT_S", title: "S", description: "Small" },
      { id: "SIZEOPT_M", title: "M", description: "Medium" },
      { id: "SIZEOPT_L", title: "L", description: "Large" },
      { id: "SIZEOPT_XL", title: "XL", description: "Extra Large" },
      { id: "SIZEOPT_XXL", title: "XXL", description: "Double XL" }
    ]
  );
}

async function sendColorPickerForClothing(phone, sel) {
  return sendListMessage(
    phone,
    `👕 *${sel.productName}*\n\n✅ Size: *${sel.size}*\n🎨 Pick your color:`,
    "Choose Color",
    getColorOptions(sel.productName)
  );
}

async function sendQtyPickerWithButtons(phone, sel) {
  return sendButtonMessage(
    phone,
    `👕 *${sel.productName}*\n\n📏 Size: *${sel.size}*\n🎨 Color: *${sel.color}*\n🔢 Quantity: *${sel.quantity}*`,
    [
      { id: "QTYMIN_" + sel.productId, title: "➖" },
      { id: "QTYPLUS_" + sel.productId, title: "➕" },
      { id: "CONFIRMCART_" + sel.productId, title: "✅ Add to Cart" }
    ]
  );
}

// ===================== CLOTHING BROWSER =====================
async function sendClothingTypes(phone, gender) {
  const types = await productRepository.getClothingTypesByGender(gender);

  if (!types.length) {
    return sendWhatsAppMessage(phone, `😕 No ${gender} clothing found.`);
  }

  return sendListMessage(
    phone,
    `👗 Choose ${gender} clothing type:`,
    "Browse",
    [
      ...types.map(t => ({
        id: `CLOTHTYPE_${gender}|${t.clothing_type}`,
        title: t.clothing_type,
        description: `Browse ${t.clothing_type}`
      })),
      { id: "CATEGORY_Clothing", title: "⬅️ Back", description: "Choose gender again" }
    ]
  );
}

async function sendClothingProducts(phone, gender, type, page = 0) {
  const allProducts = await productRepository.getClothingProducts(gender, type);

  if (!allProducts.length) {
    return sendListMessage(phone, "😕 No products found.", "Menu", [
      { id: "CATEGORY_Clothing", title: "⬅️ Back" },
      { id: "MENU_CART", title: "🛒 Cart" }
    ]);
  }

  const pageSize = 3;
  const start = page * pageSize;
  const end = start + pageSize;
  const products = allProducts.slice(start, end);
  const hasMore = end < allProducts.length;
  const total = allProducts.length;

  await sendWhatsAppMessage(phone, `👗 *${gender} ${type}*\n📄 Page ${page + 1} — ${start + 1}-${Math.min(end, total)} of ${total}`);
  await delay(300);

  for (const p of products) {
    const caption = `*${p.name}*\n💰 ${money(p.price)}\n🆔 ${p.id}\nSize: ${p.size || "-"} | Color: ${p.color || "-"}`;

    if (p.image_url && p.image_url.startsWith("http")) {
      await sendImageMessage(phone, p.image_url, caption);
    } else {
      await sendWhatsAppMessage(phone, caption);
    }
    await delay(300);

    await sendButtonMessage(phone, "Choose action:", [
      { id: `ADD_${p.id}`, title: "🛒 Add" },
      { id: `PRODUCT_${p.id}`, title: "👁️ Details" }
    ]);
    await delay(500);
  }

  const buttons = [];
  if (hasMore) {
    buttons.push({ id: `VIEWMORECLOTH__${gender}|${type}__${page + 1}`, title: "📄 View More" });
  }
  buttons.push(
    { id: "CATEGORY_Clothing", title: "⬅️ Back" },
    { id: "MENU_CART", title: "🛒 Cart" }
  );

  return sendButtonMessage(phone, "What next?", buttons);
}

// ===================== CART =====================
async function sendCart(phone) {
  delete userSelections[phone];
  const cart = await cartService.getCart(phone);

  if (!cart.items.length) {
    return sendButtonMessage(phone, "🛒 Your cart is empty.\n\nStart shopping!", [
      { id: "MENU_BROWSE", title: "🛍️ Browse" },
      { id: "MAIN_MENU", title: "🏠 Menu" }
    ]);
  }

  return sendButtonMessage(phone, formatCart(cart), [
    { id: "MENU_BROWSE", title: "🛍️ Shop More" },
    { id: "MENU_CHECKOUT", title: "💳 Checkout" },
    { id: "MAIN_MENU", title: "🏠 Menu" }
  ]);
}

// ===================== CHECKOUT =====================
async function checkout(phone) {
  delete userSelections[phone];
  userSelections[phone] = { step: "collect_address" };
  const cart = await cartService.getCart(phone);
  if (!cart.items.length) {
    delete userSelections[phone];
    return sendButtonMessage(phone, "🛒 Your cart is empty.\n\nAdd some items first!", [
      { id: "MENU_BROWSE", title: "🛍️ Browse" },
      { id: "MAIN_MENU", title: "🏠 Menu" }
    ]);
  }
  return sendWhatsAppMessage(phone, "📦 Please send your *delivery address*:\n\nExample: 123 Main St, Apt 4B, City, ZIP Code");

  if (!order) {
    return sendButtonMessage(phone, "🛒 Your cart is empty.\n\nAdd some items first!", [
      { id: "MENU_BROWSE", title: "🛍️ Browse" },
      { id: "MAIN_MENU", title: "🏠 Menu" }
    ]);
  }

  return sendWhatsAppMessage(
    phone,
    `✅ *Order Placed Successfully!*\n\n💰 Total: ${money(order.total)}\n\n🔗 Pay here:\n${order.paymentLink}\n\nThank you for shopping with us! 🙏`
  );
}

// ===================== EXPORT =====================
module.exports = {
  handleIncomingMessage
};
