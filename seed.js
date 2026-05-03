require("dotenv").config();
const mongoose = require("mongoose");

const Category = require("./models/Category");
const Product = require("./models/Product");

const categoriesData = [
  { name: "Shoes" },
  { name: "Clothing" },
  { name: "Cooking Utensils" },
  { name: "Mobile Phones" },
  { name: "Makeup" },
  { name: "Grocery" },
  { name: "Electronics" },
  { name: "Bags" },
  { name: "Watches" },
  { name: "Home Decor" },
  { name: "Books" }
];

const productsData = [

  // ─── Shoes ───────────────────────────────────────────────────────────────────
  {
    productId: "SHOE001", categoryName: "Shoes",
    name: "Urban Runner Sneakers", price: 2499,
    description: "Lightweight mesh sneakers built for daily city use. Cushioned sole for all-day comfort.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
  },
  {
    productId: "SHOE002", categoryName: "Shoes",
    name: "Classic White Trainers", price: 2999,
    description: "Minimalist white leather trainers with a clean profile. Pairs with everything.",
    imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80"
  },
  {
    productId: "SHOE003", categoryName: "Shoes",
    name: "Black Sports Shoes", price: 1999,
    description: "Durable black sports shoes with anti-slip sole. Ideal for gym and outdoor workouts.",
    imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80"
  },
  {
    productId: "SHOE004", categoryName: "Shoes",
    name: "Hiking Boots", price: 3999,
    description: "Waterproof ankle-high hiking boots with rugged grip sole. Built for tough terrain.",
    imageUrl: "https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=800&q=80"
  },
  {
    productId: "SHOE005", categoryName: "Shoes",
    name: "Slip-On Loafers", price: 1799,
    description: "Premium suede slip-on loafers. Effortlessly stylish for casual and semi-formal occasions.",
    imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80"
  },
  {
    productId: "SHOE006", categoryName: "Shoes",
    name: "Women's Heeled Sandals", price: 2199,
    description: "Elegant block-heeled sandals with ankle strap. Perfect for parties and evenings out.",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80"
  },
  {
    productId: "SHOE007", categoryName: "Shoes",
    name: "Canvas Espadrilles", price: 1299,
    description: "Lightweight canvas espadrilles with jute sole. Breezy summer footwear.",
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"
  },

  // ─── Clothing ─────────────────────────────────────────────────────────────────
  {
    productId: "CLTH001", categoryName: "Clothing",
    name: "Oversized Cotton T-Shirt", price: 799,
    description: "100% premium cotton oversized tee with dropped shoulders. Breathable everyday essential.",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    gender: "Men", clothingType: "T-Shirts", size: "L", color: "White"
  },
  {
    productId: "CLTH002", categoryName: "Clothing",
    name: "Slim Fit Denim Jacket", price: 2199,
    description: "Classic slim-fit denim jacket with chest pockets. A timeless layering piece.",
    imageUrl: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80",
    gender: "Men", clothingType: "Jackets", size: "M", color: "Blue"
  },
  {
    productId: "CLTH003", categoryName: "Clothing",
    name: "Chino Trousers", price: 1599,
    description: "Slim-fit stretch chinos in a versatile khaki shade. Smart-casual staple.",
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    gender: "Men", clothingType: "Trousers", size: "32", color: "Khaki"
  },
  {
    productId: "CLTH004", categoryName: "Clothing",
    name: "Floral Wrap Dress", price: 1899,
    description: "Flowy V-neck wrap dress with all-over floral print. Perfect for brunch or beach days.",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    gender: "Women", clothingType: "Dresses", size: "S", color: "Multicolor"
  },
  {
    productId: "CLTH005", categoryName: "Clothing",
    name: "High-Waist Joggers", price: 1199,
    description: "Soft fleece high-waist joggers with drawstring waist. Comfort meets street style.",
    imageUrl: "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&q=80",
    gender: "Women", clothingType: "Joggers", size: "M", color: "Grey"
  },
  {
    productId: "CLTH006", categoryName: "Clothing",
    name: "Printed Kurti", price: 1299,
    description: "Vibrant block-printed kurti in breathable rayon. Comfortable ethnic wear for daily use.",
    imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80",
    gender: "Women", clothingType: "Kurtis", size: "M", color: "Multicolor"
  },
  {
    productId: "CLTH007", categoryName: "Clothing",
    name: "Formal Oxford Shirt", price: 1499,
    description: "Crisp cotton Oxford shirt with button-down collar. Office-ready all week long.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
    gender: "Men", clothingType: "Shirts", size: "L", color: "Light Blue"
  },
  {
    productId: "CLTH008", categoryName: "Clothing",
    name: "Women's Blazer", price: 2799,
    description: "Tailored single-button blazer in a neutral tone. Elevates both formal and casual outfits.",
    imageUrl: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
    gender: "Women", clothingType: "Blazers", size: "S", color: "Beige"
  },

  // ─── Cooking Utensils ─────────────────────────────────────────────────────────
  {
    productId: "COOK001", categoryName: "Cooking Utensils",
    name: "Non-Stick Fry Pan", price: 899,
    description: "PFOA-free granite-coated non-stick fry pan. Even heat distribution, easy to clean.",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
  },
  {
    productId: "COOK002", categoryName: "Cooking Utensils",
    name: "Stainless Steel Pressure Cooker", price: 2499,
    description: "5-litre tri-ply stainless steel pressure cooker with safety valve. ISI certified.",
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80"
  },
  {
    productId: "COOK003", categoryName: "Cooking Utensils",
    name: "Chef's Knife Set", price: 1799,
    description: "6-piece German stainless steel knife set with wooden block. Sharp and well-balanced.",
    imageUrl: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80"
  },
  {
    productId: "COOK004", categoryName: "Cooking Utensils",
    name: "Cast Iron Skillet", price: 1599,
    description: "Pre-seasoned 10-inch cast iron skillet. Ideal for searing, baking, and slow cooking.",
    imageUrl: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&q=80"
  },
  {
    productId: "COOK005", categoryName: "Cooking Utensils",
    name: "Silicone Spatula Set", price: 499,
    description: "Heat-resistant silicone spatulas in 3 sizes. Flexible, non-scratch, dishwasher safe.",
    imageUrl: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=800&q=80"
  },
  {
    productId: "COOK006", categoryName: "Cooking Utensils",
    name: "Wooden Cutting Board", price: 799,
    description: "Acacia wood cutting board with juice groove. Gentle on knife edges, naturally antibacterial.",
    imageUrl: "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?w=800&q=80"
  },

  // ─── Mobile Phones ────────────────────────────────────────────────────────────
  {
    productId: "MOB001", categoryName: "Mobile Phones",
    name: "Nova X1 Smartphone", price: 12999,
    description: "6GB RAM | 128GB Storage | 6.5\" FHD+ display | 50MP triple camera | 5000mAh battery.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"
  },
  {
    productId: "MOB002", categoryName: "Mobile Phones",
    name: "ZenPro 5G", price: 21999,
    description: "5G-ready phone with 8GB RAM | 256GB | 120Hz AMOLED display | 108MP main camera.",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80"
  },
  {
    productId: "MOB003", categoryName: "Mobile Phones",
    name: "BudgetPlus Y2", price: 8499,
    description: "Reliable budget smartphone with 4GB RAM | 64GB | long-lasting 6000mAh battery.",
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80"
  },
  {
    productId: "MOB004", categoryName: "Mobile Phones",
    name: "iFruit Mini", price: 49999,
    description: "Premium compact flagship with ceramic build | 256GB | ProRAW camera system.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80"
  },
  {
    productId: "MOB005", categoryName: "Mobile Phones",
    name: "GalaxyFold Ultra", price: 89999,
    description: "Foldable smartphone with 12GB RAM | 512GB | dual screen | S-Pen support.",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80"
  },
  {
    productId: "MOB006", categoryName: "Mobile Phones",
    name: "Pixel Clear 8", price: 34999,
    description: "Pure Android experience with 7 years of updates | Tensor chip | 50MP camera.",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80"
  },

  // ─── Makeup ───────────────────────────────────────────────────────────────────
  {
    productId: "MAKE001", categoryName: "Makeup",
    name: "Matte Lipstick", price: 499,
    description: "Highly pigmented long-lasting matte lipstick. Available in 12 bold shades.",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4e6232bf2178?w=800&q=80"
  },
  {
    productId: "MAKE002", categoryName: "Makeup",
    name: "HD Foundation", price: 899,
    description: "Buildable medium-to-full coverage liquid foundation with SPF 15. 30 shades.",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
  },
  {
    productId: "MAKE003", categoryName: "Makeup",
    name: "Eyeshadow Palette – Nudes", price: 1299,
    description: "18-pan neutral eyeshadow palette with matte, shimmer, and glitter finishes.",
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80"
  },
  {
    productId: "MAKE004", categoryName: "Makeup",
    name: "Volumising Mascara", price: 649,
    description: "Fibrous volumising mascara with curved brush. Adds dramatic length and curl.",
    imageUrl: "https://images.unsplash.com/photo-1631214500004-70d2b46e5fc2?w=800&q=80"
  },
  {
    productId: "MAKE005", categoryName: "Makeup",
    name: "Setting Powder", price: 749,
    description: "Translucent loose setting powder. Locks makeup for up to 16 hours, controls shine.",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"
  },
  {
    productId: "MAKE006", categoryName: "Makeup",
    name: "Highlighter Stick", price: 549,
    description: "Cream-to-powder highlighter stick for a natural glow on cheekbones and brow bone.",
    imageUrl: "https://images.unsplash.com/photo-1643543677934-3e1e695379c0?w=800&q=80"
  },

  // ─── Grocery ──────────────────────────────────────────────────────────────────
  {
    productId: "GROC001", categoryName: "Grocery",
    name: "Organic Basmati Rice – 5kg", price: 699,
    description: "Premium aged organic basmati rice. Long grains, aromatic, and non-sticky.",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
  },
  {
    productId: "GROC002", categoryName: "Grocery",
    name: "Cold-Pressed Coconut Oil – 1L", price: 499,
    description: "100% pure cold-pressed virgin coconut oil. No additives, suitable for cooking and hair care.",
    imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80"
  },
  {
    productId: "GROC003", categoryName: "Grocery",
    name: "Multiflora Honey – 500g", price: 349,
    description: "Raw unprocessed multiflora honey. Rich in antioxidants, no added sugar.",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80"
  },
  {
    productId: "GROC004", categoryName: "Grocery",
    name: "Mixed Dry Fruits Pack – 500g", price: 599,
    description: "Premium assorted dry fruits: almonds, cashews, raisins, and pistachios.",
    imageUrl: "https://images.unsplash.com/photo-1606791422814-b32c705e3e2f?w=800&q=80"
  },
  {
    productId: "GROC005", categoryName: "Grocery",
    name: "Whole Wheat Flour – 10kg", price: 449,
    description: "Stone-ground whole wheat atta with natural bran. Makes soft rotis.",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80"
  },
  {
    productId: "GROC006", categoryName: "Grocery",
    name: "Green Tea – 100 Bags", price: 299,
    description: "Premium Darjeeling green tea bags. Light, refreshing, rich in antioxidants.",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80"
  },

  // ─── Electronics ──────────────────────────────────────────────────────────────
  {
    productId: "ELEC001", categoryName: "Electronics",
    name: "True Wireless Earbuds", price: 2999,
    description: "Active noise-cancelling TWS earbuds. 30hr total battery life, IPX5 water resistance.",
    imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80"
  },
  {
    productId: "ELEC002", categoryName: "Electronics",
    name: "Portable Bluetooth Speaker", price: 1999,
    description: "360° sound, 20W output, 12hr battery. Waterproof IPX7 design for outdoor use.",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"
  },
  {
    productId: "ELEC003", categoryName: "Electronics",
    name: "65W Fast Charger", price: 1299,
    description: "GaN 65W USB-C fast charger compatible with laptops, phones, and tablets.",
    imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80"
  },
  {
    productId: "ELEC004", categoryName: "Electronics",
    name: "Smart LED Strip Lights", price: 899,
    description: "5-metre RGB smart LED strip with app and voice control. 16M colour options.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
  },
  {
    productId: "ELEC005", categoryName: "Electronics",
    name: "Mechanical Gaming Keyboard", price: 3999,
    description: "TKL mechanical keyboard with RGB backlight and tactile brown switches.",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"
  },
  {
    productId: "ELEC006", categoryName: "Electronics",
    name: "Noise-Cancelling Headphones", price: 5999,
    description: "Over-ear ANC headphones with Hi-Res audio, 40hr battery, and foldable design.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
  },
  {
    productId: "ELEC007", categoryName: "Electronics",
    name: "10000mAh Power Bank", price: 1499,
    description: "Slim dual-output power bank with 22.5W fast charging and LED indicator.",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80"
  },

  // ─── Bags ─────────────────────────────────────────────────────────────────────
  {
    productId: "BAG001", categoryName: "Bags",
    name: "Travel Backpack", price: 1999,
    description: "35L travel backpack with USB charging port, laptop sleeve, and multiple pockets.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
  },
  {
    productId: "BAG002", categoryName: "Bags",
    name: "Laptop Messenger Bag", price: 1499,
    description: "Water-resistant canvas messenger bag fits up to 15.6\" laptops. Padded compartment.",
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80"
  },
  {
    productId: "BAG003", categoryName: "Bags",
    name: "Women's Tote Bag", price: 1299,
    description: "Spacious vegan leather tote with interior zip pocket. Minimalist everyday carry.",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80"
  },
  {
    productId: "BAG004", categoryName: "Bags",
    name: "Gym Duffel Bag", price: 1199,
    description: "30L gym bag with separate shoe compartment and ventilated mesh pockets.",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"
  },
  {
    productId: "BAG005", categoryName: "Bags",
    name: "Mini Crossbody Bag", price: 999,
    description: "Compact crossbody bag with adjustable strap. Perfect for evenings out.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4b4fb0?w=800&q=80"
  },
  {
    productId: "BAG006", categoryName: "Bags",
    name: "Rolling Suitcase – 20 inch", price: 3999,
    description: "Hardshell carry-on suitcase with TSA lock and 360° spinner wheels.",
    imageUrl: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&q=80"
  },

  // ─── Watches ──────────────────────────────────────────────────────────────────
  {
    productId: "WTCH001", categoryName: "Watches",
    name: "Classic Analog Watch", price: 2499,
    description: "Minimalist dial with genuine leather strap. Japanese quartz movement, 5ATM water resistant.",
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"
  },
  {
    productId: "WTCH002", categoryName: "Watches",
    name: "Smart Fitness Watch", price: 3999,
    description: "1.4\" AMOLED smartwatch with SpO2, heart rate, sleep tracking, and 7-day battery.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
  },
  {
    productId: "WTCH003", categoryName: "Watches",
    name: "Chronograph Steel Watch", price: 5999,
    description: "Stainless steel chronograph with sapphire-coated glass and date window.",
    imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80"
  },
  {
    productId: "WTCH004", categoryName: "Watches",
    name: "Women's Rose Gold Watch", price: 3499,
    description: "Elegant rose gold case with mesh strap and mother-of-pearl dial.",
    imageUrl: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=80"
  },
  {
    productId: "WTCH005", categoryName: "Watches",
    name: "Diver's Sports Watch", price: 4999,
    description: "200m water-resistant diver watch with rotating bezel and luminous hands.",
    imageUrl: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80"
  },
  {
    productId: "WTCH006", categoryName: "Watches",
    name: "Wooden Watch", price: 2999,
    description: "Handcrafted natural bamboo watch. Lightweight, eco-friendly, unique grain pattern.",
    imageUrl: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80"
  },

  // ─── Home Decor ───────────────────────────────────────────────────────────────
  {
    productId: "DECO001", categoryName: "Home Decor",
    name: "Scented Soy Candles – Set of 3", price: 699,
    description: "Hand-poured soy wax candles in lavender, sandalwood, and vanilla. 40hr burn each.",
    imageUrl: "https://images.unsplash.com/photo-1602874801006-31b35a71ad5f?w=800&q=80"
  },
  {
    productId: "DECO002", categoryName: "Home Decor",
    name: "Macramé Wall Hanging", price: 899,
    description: "Handcrafted bohemian macramé wall hanging. Natural cotton, 60cm wide.",
    imageUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80"
  },
  {
    productId: "DECO003", categoryName: "Home Decor",
    name: "Ceramic Planter Set", price: 1199,
    description: "Set of 3 minimalist matte ceramic planters in different sizes. Drainage hole included.",
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80"
  },
  {
    productId: "DECO004", categoryName: "Home Decor",
    name: "Woven Jute Rug – 4×6 ft", price: 2499,
    description: "Natural jute area rug, hand-woven, reversible. Adds earthy warmth to any room.",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
  },
  {
    productId: "DECO005", categoryName: "Home Decor",
    name: "Decorative Throw Pillow Set", price: 1099,
    description: "Set of 2 velvet throw pillows with geometric embroidery. 45×45 cm, insert included.",
    imageUrl: "https://images.unsplash.com/photo-1588099883999-bb23bc7a26c6?w=800&q=80"
  },
  {
    productId: "DECO006", categoryName: "Home Decor",
    name: "Glass Vase Set", price: 799,
    description: "Set of 3 hand-blown glass bud vases in smoke, amber, and clear. Table centrepieces.",
    imageUrl: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=800&q=80"
  },

  // ─── Books ────────────────────────────────────────────────────────────────────
  {
    productId: "BOOK001", categoryName: "Books",
    name: "Atomic Habits", price: 399,
    description: "James Clear's #1 bestseller on building good habits and breaking bad ones.",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"
  },
  {
    productId: "BOOK002", categoryName: "Books",
    name: "The Psychology of Money", price: 349,
    description: "Morgan Housel's timeless lessons on wealth, greed, and happiness.",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"
  },
  {
    productId: "BOOK003", categoryName: "Books",
    name: "Sapiens: A Brief History of Humankind", price: 499,
    description: "Yuval Noah Harari's acclaimed narrative of the human journey from savanna to civilisation.",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80"
  },
  {
    productId: "BOOK004", categoryName: "Books",
    name: "Deep Work", price: 379,
    description: "Cal Newport's guide to focused success in a distracted world.",
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
  },
  {
    productId: "BOOK005", categoryName: "Books",
    name: "The Alchemist", price: 299,
    description: "Paulo Coelho's beloved fable about following your dreams and listening to your heart.",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
  },
  {
    productId: "BOOK006", categoryName: "Books",
    name: "Think and Grow Rich", price: 249,
    description: "Napoleon Hill's classic on the mindset and philosophy of wealth and success.",
    imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80"
  },
  {
    productId: "BOOK007", categoryName: "Books",
    name: "Rich Dad Poor Dad", price: 329,
    description: "Robert Kiyosaki's personal finance classic on financial literacy and investing.",
    imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80"
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    await Category.deleteMany({});
    await Product.deleteMany({});

    const categories = await Category.insertMany(categoriesData);

    const categoryMap = {};
    categories.forEach(c => (categoryMap[c.name] = c._id));

    const products = productsData.map(p => ({
      ...p,
      category: categoryMap[p.categoryName],
      isActive: true
    }));

    await Product.insertMany(products);

    console.log(`✅ Seeding completed — ${products.length} products across ${categories.length} categories`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();