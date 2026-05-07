require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const Category = require("./models/Category");
const Product = require("./models/Product");

const productImages = {
  BAG001: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?fm=jpg&w=800&q=80",
  BAG002: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?fm=jpg&w=800&q=80",
  BAG003: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?fm=jpg&w=800&q=80",
  BAG004: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?fm=jpg&w=800&q=80",
  BAG005: "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?fm=jpg&w=800&q=80",
  BAG006: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?fm=jpg&w=800&q=80",

  BOOK001: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?fm=jpg&w=800&q=80",
  BOOK002: "https://images.unsplash.com/photo-1512820790803-83ca734da794?fm=jpg&w=800&q=80",
  BOOK003: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?fm=jpg&w=800&q=80",
  BOOK004: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?fm=jpg&w=800&q=80",
  BOOK005: "https://images.unsplash.com/photo-1532012197267-da84d127e765?fm=jpg&w=800&q=80",
  BOOK006: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?fm=jpg&w=800&q=80",
  BOOK007: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?fm=jpg&w=800&q=80",
  BOOK008: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?fm=jpg&w=800&q=80",

  CLOTH001: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?fm=jpg&w=800&q=80",
  CLOTH002: "https://images.unsplash.com/photo-1542272604-787c3835535d?fm=jpg&w=800&q=80",
  CLOTH003: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?fm=jpg&w=800&q=80",

  CLOTH004: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?fm=jpg&w=800&q=80",
  CLOTH005: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?fm=jpg&w=800&q=80",
  CLOTH006: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?fm=jpg&w=800&q=80",

  CLOTH007: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?fm=jpg&w=800&q=80",
  CLOTH008: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?fm=jpg&w=800&q=80",
  CLOTH009: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?fm=jpg&w=800&q=80",

  COOK001: "https://images.unsplash.com/photo-1584990347449-a2d4c4f0c61d?fm=jpg&w=800&q=80",
  COOK002: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?fm=jpg&w=800&q=80",
  COOK003: "https://images.unsplash.com/photo-1556911220-bff31c812dba?fm=jpg&w=800&q=80",

  COOK004: "https://images.unsplash.com/photo-1593618998160-e34014e67546?fm=jpg&w=800&q=80",
  COOK005: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?fm=jpg&w=800&q=80",
  COOK006: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?fm=jpg&w=800&q=80",

  COOK007: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?fm=jpg&w=800&q=80",
  COOK008: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?fm=jpg&w=800&q=80",
  COOK009: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?fm=jpg&w=800&q=80",

  ELEC001: "https://images.unsplash.com/photo-1518441902112-fc3b7f4d1b7c?fm=jpg&w=800&q=80",
  ELEC002: "https://images.unsplash.com/photo-1585386959984-a41552231658?fm=jpg&w=800&q=80",
  ELEC003: "https://images.unsplash.com/photo-1580894908361-967195033215?fm=jpg&w=800&q=80",

  ELEC004: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?fm=jpg&w=800&q=80",
  ELEC005: "https://images.unsplash.com/photo-1587202372775-9890f7b6b9b4?fm=jpg&w=800&q=80",
  ELEC006: "https://images.unsplash.com/photo-1587202372775-9890f7b6b9b4?fm=jpg&w=800&q=80",

  ELEC007: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?fm=jpg&w=800&q=80",
  ELEC008: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?fm=jpg&w=800&q=80",
  ELEC009: "https://images.unsplash.com/photo-1580910051074-3eb694886505?fm=jpg&w=800&q=80",

  GROC001: "https://images.unsplash.com/photo-1586201375761-83865001e31c?fm=jpg&w=800&q=80",
  GROC002: "https://images.unsplash.com/photo-1603046891744-76e6300f82ef?fm=jpg&w=800&q=80",
  GROC003: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?fm=jpg&w=800&q=80",

  GROC004: "https://images.unsplash.com/photo-1563636619-e9143da7973b?fm=jpg&w=800&q=80",
  GROC005: "https://images.unsplash.com/photo-1589985270958-66f249e4f2b8?fm=jpg&w=800&q=80",
  GROC006: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?fm=jpg&w=800&q=80",

  GROC007: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?fm=jpg&w=800&q=80",
  GROC008: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?fm=jpg&w=800&q=80",
  GROC009: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?fm=jpg&w=800&q=80",

  HOME001: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2c3f?fm=jpg&w=800&q=80",
  HOME002: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?fm=jpg&w=800&q=80",
  HOME003: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?fm=jpg&w=800&q=80",

  HOME004: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?fm=jpg&w=800&q=80",
  HOME005: "https://images.unsplash.com/photo-1582582494700-8d0a4d8f5d4f?fm=jpg&w=800&q=80",
  HOME006: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?fm=jpg&w=800&q=80",

  HOME007: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fm=jpg&w=800&q=80",
  HOME008: "https://images.unsplash.com/photo-1582582494700-8d0a4d8f5d4f?fm=jpg&w=800&q=80",
  HOME009: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?fm=jpg&w=800&q=80",

  MAKE001: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?fm=jpg&w=800&q=80",
  MAKE002: "https://images.unsplash.com/photo-1583241800698-8c3c3b2e9c4f?fm=jpg&w=800&q=80",
  MAKE003: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?fm=jpg&w=800&q=80",

  MAKE004: "https://images.unsplash.com/photo-1583241800698-8c3c3b2e9c4f?fm=jpg&w=800&q=80",
  MAKE005: "https://images.unsplash.com/photo-1583241800698-8c3c3b2e9c4f?fm=jpg&w=800&q=80",
  MAKE006: "https://images.unsplash.com/photo-1583241800698-8c3c3b2e9c4f?fm=jpg&w=800&q=80",

  MAKE007: "https://images.unsplash.com/photo-1583241800698-8c3c3b2e9c4f?fm=jpg&w=800&q=80",
  MAKE008: "https://images.unsplash.com/photo-1583241800698-8c3c3b2e9c4f?fm=jpg&w=800&q=80",
  MAKE009: "https://images.unsplash.com/photo-1583241800698-8c3c3b2e9c4f?fm=jpg&w=800&q=80",

  MOB001: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?fm=jpg&w=800&q=80",
  MOB002: "https://images.unsplash.com/photo-1510557880182-3b5b6b2c6f8d?fm=jpg&w=800&q=80",
  MOB003: "https://images.unsplash.com/photo-1580910051074-3eb694886505?fm=jpg&w=800&q=80",

  MOB004: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?fm=jpg&w=800&q=80",
  MOB005: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?fm=jpg&w=800&q=80",
  MOB006: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?fm=jpg&w=800&q=80",

  MOB007: "https://images.unsplash.com/photo-1580910051074-3eb694886505?fm=jpg&w=800&q=80",
  MOB008: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?fm=jpg&w=800&q=80",
  MOB009: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?fm=jpg&w=800&q=80",

  SHOE001: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?fm=jpg&w=800&q=80",
  SHOE002: "https://images.unsplash.com/photo-1528701800489-20be1c61c0c4?fm=jpg&w=800&q=80",
  SHOE003: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?fm=jpg&w=800&q=80",

  SHOE004: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fm=jpg&w=800&q=80",
  SHOE005: "https://images.unsplash.com/photo-1585386959984-a41552231658?fm=jpg&w=800&q=80",
  SHOE006: "https://images.unsplash.com/photo-1581101767113-1677fc8bdecb?fm=jpg&w=800&q=80",

  SHOE007: "https://images.unsplash.com/photo-1528701800489-20be1c61c0c4?fm=jpg&w=800&q=80",
  SHOE008: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?fm=jpg&w=800&q=80",
  SHOE009: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?fm=jpg&w=800&q=80",
};

const img = (id) =>
  productImages[id] ||
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany({});
    await Category.deleteMany({});

    const categoryNames = [
      "Bags",
      "Books",
      "Clothing",
      "Cooking Utensils",
      "Electronics",
      "Grocery",
      "Home Decor",
      "Makeup",
      "Mobile Phones",
      "Shoes"
    ];

    const categories = {};
    for (const name of categoryNames) {
      categories[name] = await Category.create({ name });
    }

    const products = [
      // BAGS
      ["BAG001", "Bags", "Leather Bags", "Hidesign Leather Office Bag", 3499, "Premium leather office bag with laptop space."],
      ["BAG002", "Bags", "Leather Bags", "Lavie Women Leather Handbag", 2299, "Stylish handbag for office and daily use."],
      ["BAG003", "Bags", "Normal Bags", "Skybags Casual Backpack", 1299, "Daily college and office backpack."],
      ["BAG004", "Bags", "Normal Bags", "Wildcraft Laptop Backpack", 1899, "Laptop backpack with rain cover."],
      ["BAG005", "Bags", "Travel Bags", "American Tourister Duffel Bag", 2499, "Large travel duffel bag."],
      ["BAG006", "Bags", "Travel Bags", "Safari Trolley Bag", 3999, "Hard case travel trolley bag."],

      // BOOKS
["BOOK001", "Books", "Self Help Books", "Atomic Habits", 499, "Build good habits and break bad ones."],
["BOOK002", "Books", "Self Help Books", "The Power of Now", 399, "Guide to mindfulness and self-growth."],

["BOOK003", "Books", "Finance Books", "Rich Dad Poor Dad", 450, "Learn money management and financial freedom."],
["BOOK004", "Books", "Finance Books", "The Psychology of Money", 499, "Understand money behavior and investing mindset."],

["BOOK005", "Books", "Programming Books", "Clean Code", 799, "Learn to write readable and maintainable code."],
["BOOK006", "Books", "Programming Books", "You Don’t Know JS", 699, "Deep dive into JavaScript concepts."],

["BOOK007", "Books", "Self Help Books", "Think and Grow Rich", 299, "Classic book on success mindset."],
["BOOK008", "Books", "Self Help Books", "Deep Work", 549, "Improve focus and productivity."],

      // CLOTHING
["CLOTH001", "Clothing", "Men", "Men Cotton T-Shirt", 499, "Comfortable cotton t-shirt for daily wear."],
["CLOTH002", "Clothing", "Men", "Men Slim Fit Jeans", 1299, "Blue denim slim fit jeans."],
["CLOTH003", "Clothing", "Men", "Men Formal Shirt", 899, "Office wear formal shirt."],

["CLOTH004", "Clothing", "Women", "Women Kurti", 999, "Traditional printed kurti."],
["CLOTH005", "Clothing", "Women", "Women Saree", 1799, "Soft silk saree for occasions."],
["CLOTH006", "Clothing", "Women", "Women Western Dress", 1499, "Stylish party wear western dress."],

["CLOTH007", "Clothing", "Kids", "Kids Cartoon T-Shirt", 399, "Soft cotton cartoon t-shirt for kids."],
["CLOTH008", "Clothing", "Kids", "Kids Denim Shorts", 599, "Comfortable denim shorts for kids."],
["CLOTH009", "Clothing", "Kids", "Kids Party Frock", 999, "Cute party wear frock for kids."],

      // COOKING
["COOK001", "Cooking Utensils", "Cookware", "Prestige Pressure Cooker", 2199, "5 litre stainless steel pressure cooker."],
["COOK002", "Cooking Utensils", "Cookware", "Non Stick Fry Pan", 899, "Non-stick frying pan for daily cooking."],
["COOK003", "Cooking Utensils", "Cookware", "Stainless Steel Kadai", 1199, "Deep stainless steel kadai for Indian cooking."],

["COOK004", "Cooking Utensils", "Kitchen Tools", "Kitchen Knife Set", 699, "Sharp stainless steel kitchen knife set."],
["COOK005", "Cooking Utensils", "Kitchen Tools", "Silicone Spatula Set", 349, "Heat-resistant spatula set for cooking."],
["COOK006", "Cooking Utensils", "Kitchen Tools", "Gas Lighter", 199, "Safe kitchen gas lighter."],

["COOK007", "Cooking Utensils", "Appliances", "Mixer Grinder", 3299, "750W mixer grinder for kitchen use."],
["COOK008", "Cooking Utensils", "Appliances", "Induction Cooktop", 2499, "Portable induction stove for modern cooking."],
["COOK009", "Cooking Utensils", "Appliances", "Electric Kettle", 999, "Fast boiling electric kettle."],

      // ELECTRONICS
["ELEC001", "Electronics", "Audio Devices", "Sony Wireless Headphones", 2999, "Noise cancelling wireless headphones."],
["ELEC002", "Electronics", "Audio Devices", "Boat Bluetooth Speaker", 1499, "Portable Bluetooth speaker with bass."],
["ELEC003", "Electronics", "Audio Devices", "Realme Earbuds", 1999, "True wireless earbuds with mic."],

["ELEC004", "Electronics", "Computer Accessories", "Wireless Keyboard", 1299, "Slim wireless keyboard for office use."],
["ELEC005", "Electronics", "Computer Accessories", "Logitech Mouse", 799, "Smooth wireless optical mouse."],
["ELEC006", "Electronics", "Computer Accessories", "Laptop Stand", 999, "Adjustable aluminum laptop stand."],

["ELEC007", "Electronics", "Smart Gadgets", "Smart Watch", 2499, "Fitness tracking smartwatch."],
["ELEC008", "Electronics", "Smart Gadgets", "Smart Bulb", 699, "WiFi enabled smart LED bulb."],
["ELEC009", "Electronics", "Smart Gadgets", "Power Bank 20000mAh", 1799, "Fast charging power bank."],

      // GROCERY
["GROC001", "Grocery", "Rice and Grains", "India Gate Basmati Rice 5kg", 699, "Premium long grain basmati rice."],
["GROC002", "Grocery", "Rice and Grains", "Aashirvaad Atta 5kg", 289, "Whole wheat flour for daily use."],
["GROC003", "Grocery", "Rice and Grains", "Toor Dal 1kg", 179, "High quality toor dal for cooking."],

["GROC004", "Grocery", "Dairy and Eggs", "Amul Milk 1L", 68, "Fresh toned milk pack."],
["GROC005", "Grocery", "Dairy and Eggs", "Amul Butter 500g", 275, "Creamy salted butter."],
["GROC006", "Grocery", "Dairy and Eggs", "Farm Fresh Eggs Pack", 90, "Pack of 6 fresh eggs."],

["GROC007", "Grocery", "Daily Essentials", "Fortune Sunflower Oil 1L", 145, "Refined sunflower cooking oil."],
["GROC008", "Grocery", "Daily Essentials", "Tata Salt 1kg", 28, "Iodized salt for daily cooking."],
["GROC009", "Grocery", "Daily Essentials", "Red Label Tea 500g", 299, "Strong tea powder for daily chai."],

      // HOME DECOR
["HOME001", "Home Decor", "Lighting Decor", "LED String Lights", 499, "Warm decorative LED string lights for home."],
["HOME002", "Home Decor", "Lighting Decor", "Table Lamp", 899, "Modern bedside table lamp."],
["HOME003", "Home Decor", "Lighting Decor", "Wall Light Lamp", 1299, "Stylish wall mounted lamp."],

["HOME004", "Home Decor", "Wall Decor", "Abstract Wall Painting", 1499, "Modern abstract wall art painting."],
["HOME005", "Home Decor", "Wall Decor", "Wall Clock", 799, "Minimalist designer wall clock."],
["HOME006", "Home Decor", "Wall Decor", "Photo Frame Set", 699, "Set of decorative photo frames."],

["HOME007", "Home Decor", "Soft Furnishing", "Cushion Cover Set", 599, "Soft decorative cushion covers."],
["HOME008", "Home Decor", "Soft Furnishing", "Bed Sheet Set", 1299, "Comfortable cotton bed sheet set."],
["HOME009", "Home Decor", "Soft Furnishing", "Door Curtain", 999, "Elegant door curtain for home."],

      // MAKEUP
["MAKE001", "Makeup", "Face Makeup", "Lakme Foundation", 599, "Smooth liquid foundation for daily use."],
["MAKE002", "Makeup", "Face Makeup", "Compact Powder", 349, "Matte finish compact powder."],
["MAKE003", "Makeup", "Face Makeup", "BB Cream", 299, "Lightweight BB cream for natural look."],

["MAKE004", "Makeup", "Eye Makeup", "Maybelline Mascara", 499, "Volumizing mascara for long lashes."],
["MAKE005", "Makeup", "Eye Makeup", "Eyeliner Pen", 249, "Waterproof liquid eyeliner."],
["MAKE006", "Makeup", "Eye Makeup", "Eyeshadow Palette", 799, "Multi-color eyeshadow palette."],

["MAKE007", "Makeup", "Lip and Nail", "Matte Lipstick", 399, "Long-lasting matte lipstick."],
["MAKE008", "Makeup", "Lip and Nail", "Lip Gloss", 299, "Shiny lip gloss for daily use."],
["MAKE009", "Makeup", "Lip and Nail", "Nail Polish Set", 499, "Pack of 6 colorful nail paints."],

      // MOBILE PHONES
["MOB001", "Mobile Phones", "Apple Phones", "iPhone 13", 59999, "Apple iPhone 13 with A15 Bionic chip."],
["MOB002", "Mobile Phones", "Apple Phones", "iPhone 14", 69999, "Apple iPhone 14 with improved camera."],
["MOB003", "Mobile Phones", "Apple Phones", "iPhone 15", 79999, "Latest iPhone 15 with dynamic island."],

["MOB004", "Mobile Phones", "Samsung Phones", "Samsung Galaxy S21", 49999, "Flagship Samsung smartphone."],
["MOB005", "Mobile Phones", "Samsung Phones", "Samsung Galaxy S22", 59999, "High performance Android phone."],
["MOB006", "Mobile Phones", "Samsung Phones", "Samsung Galaxy A54", 32999, "Mid-range Samsung smartphone."],

["MOB007", "Mobile Phones", "Motorola Phones", "Moto G73", 18999, "Affordable 5G Motorola phone."],
["MOB008", "Mobile Phones", "Motorola Phones", "Moto Edge 40", 29999, "Premium Motorola Edge series phone."],
["MOB009", "Mobile Phones", "Motorola Phones", "Moto G Power", 15999, "Long battery life smartphone."],

      // SHOES
["SHOE001", "Shoes", "Casual Shoes", "Puma Casual Sneakers", 2499, "Comfortable everyday casual sneakers."],
["SHOE002", "Shoes", "Casual Shoes", "Nike Air Casual Shoes", 3499, "Stylish Nike casual wear shoes."],
["SHOE003", "Shoes", "Casual Shoes", "Adidas Street Sneakers", 2999, "Trendy street style sneakers."],

["SHOE004", "Shoes", "Formal Shoes", "Leather Formal Shoes", 1999, "Classic leather office shoes."],
["SHOE005", "Shoes", "Formal Shoes", "Black Oxford Shoes", 2499, "Premium formal Oxford shoes."],
["SHOE006", "Shoes", "Formal Shoes", "Brown Derby Shoes", 2299, "Elegant brown formal shoes."],

["SHOE007", "Shoes", "Sports Shoes", "Nike Running Shoes", 3999, "Lightweight running shoes."],
["SHOE008", "Shoes", "Sports Shoes", "Adidas Sports Shoes", 3599, "Comfortable sports training shoes."],
["SHOE009", "Shoes", "Sports Shoes", "Puma Gym Shoes", 3299, "Durable gym workout shoes."],
    ];

   await Product.insertMany(
  products.map(([id, category, subcategory, name, price, description]) => ({
    id,
    categoryId: categories[category]._id,
    name,
    price,
    description,
    imageUrl: img(id),

    gender:
      subcategory === "Men" ? "Men" :
      subcategory === "Women" ? "Women" :
      subcategory === "Kids" ? "Kids" :
      null,

    clothingType: subcategory,
    size: category === "Clothing" || category === "Shoes" ? "M" : null,
    color: "Assorted",
    isActive: true,
    category
  }))
);

    console.log("✅ Seed completed: 10 categories and 60 products added");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();