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
  // Shoes
  { productId: "SHOE001", categoryName: "Shoes", name: "Urban Runner Sneakers", price: 2499, description: "Lightweight sneakers for daily use.", imageUrl: "https://picsum.photos/seed/shoe001/600/400" },
  { productId: "SHOE002", categoryName: "Shoes", name: "Classic White Trainers", price: 2999, description: "Minimal white trainers for casual wear.", imageUrl: "https://picsum.photos/seed/shoe002/600/400" },
  { productId: "SHOE003", categoryName: "Shoes", name: "Black Sports Shoes", price: 1999, description: "Comfortable sports shoes for walking and gym.", imageUrl: "https://picsum.photos/seed/shoe003/600/400" },
  { productId: "SHOE004", categoryName: "Shoes", name: "Brown Formal Shoes", price: 3499, description: "Premium formal shoes for office wear.", imageUrl: "https://picsum.photos/seed/shoe004/600/400" },
  { productId: "SHOE005", categoryName: "Shoes", name: "Slip-On Loafers", price: 1799, description: "Easy slip-on loafers for everyday style.", imageUrl: "https://picsum.photos/seed/shoe005/600/400" },
  { productId: "SHOE006", categoryName: "Shoes", name: "Running Pro Shoes", price: 4299, description: "High-grip running shoes with soft cushioning.", imageUrl: "https://picsum.photos/seed/shoe006/600/400" },
  { productId: "SHOE007", categoryName: "Shoes", name: "Canvas Casual Shoes", price: 1299, description: "Trendy canvas shoes for college and casual use.", imageUrl: "https://picsum.photos/seed/shoe007/600/400" },

  // Clothing
  { productId: "CLTH001", categoryName: "Clothing", name: "Oversized Cotton T-Shirt", price: 799, description: "Premium cotton oversized T-shirt.", imageUrl: "https://picsum.photos/seed/clth001/600/400", gender: "Men", clothingType: "T-Shirts", size: "L", color: "White" },
  { productId: "CLTH002", categoryName: "Clothing", name: "Slim Fit Denim Jacket", price: 2199, description: "Stylish denim jacket for everyday outfits.", imageUrl: "https://picsum.photos/seed/clth002/600/400", gender: "Men", clothingType: "Jackets", size: "M", color: "Blue" },
  { productId: "CLTH003", categoryName: "Clothing", name: "Formal White Shirt", price: 999, description: "Classic white shirt for office and events.", imageUrl: "https://picsum.photos/seed/clth003/600/400", gender: "Men", clothingType: "Shirts", size: "M", color: "White" },
  { productId: "CLTH004", categoryName: "Clothing", name: "Black Hoodie", price: 1499, description: "Warm hoodie with soft fabric.", imageUrl: "https://picsum.photos/seed/clth004/600/400", gender: "Men", clothingType: "Hoodies", size: "L", color: "Black" },
  { productId: "CLTH005", categoryName: "Clothing", name: "Blue Jeans", price: 1799, description: "Comfort fit blue denim jeans.", imageUrl: "https://picsum.photos/seed/clth005/600/400", gender: "Men", clothingType: "Jeans", size: "32", color: "Blue" },
  { productId: "CLTH006", categoryName: "Clothing", name: "Printed Kurti", price: 1299, description: "Elegant printed kurti for daily wear.", imageUrl: "https://picsum.photos/seed/clth006/600/400", gender: "Women", clothingType: "Kurtis", size: "M", color: "Multicolor" },
  { productId: "CLTH007", categoryName: "Clothing", name: "Cotton Shorts", price: 699, description: "Comfortable cotton shorts for summer.", imageUrl: "https://picsum.photos/seed/clth007/600/400", gender: "Men", clothingType: "Shorts", size: "M", color: "Grey" },

  // Cooking Utensils
  { productId: "COOK001", categoryName: "Cooking Utensils", name: "Non-Stick Fry Pan", price: 899, description: "Durable non-stick pan for everyday cooking.", imageUrl: "https://picsum.photos/seed/cook001/600/400" },
  { productId: "COOK002", categoryName: "Cooking Utensils", name: "Steel Pressure Cooker", price: 2499, description: "5L stainless steel pressure cooker.", imageUrl: "https://picsum.photos/seed/cook002/600/400" },
  { productId: "COOK003", categoryName: "Cooking Utensils", name: "Kitchen Knife Set", price: 1199, description: "Sharp stainless steel knife set.", imageUrl: "https://picsum.photos/seed/cook003/600/400" },
  { productId: "COOK004", categoryName: "Cooking Utensils", name: "Wooden Spatula Set", price: 399, description: "Eco-friendly wooden spatulas.", imageUrl: "https://picsum.photos/seed/cook004/600/400" },
  { productId: "COOK005", categoryName: "Cooking Utensils", name: "Mixing Bowl Set", price: 799, description: "Multi-size mixing bowls for kitchen use.", imageUrl: "https://picsum.photos/seed/cook005/600/400" },
  { productId: "COOK006", categoryName: "Cooking Utensils", name: "Steel Tawa", price: 999, description: "Heavy-duty tawa for dosa and roti.", imageUrl: "https://picsum.photos/seed/cook006/600/400" },
  { productId: "COOK007", categoryName: "Cooking Utensils", name: "Measuring Cup Set", price: 299, description: "Accurate measuring cups for cooking.", imageUrl: "https://picsum.photos/seed/cook007/600/400" },

  // Mobile Phones
  { productId: "MOB001", categoryName: "Mobile Phones", name: "Nova X1 Smartphone", price: 12999, description: "6GB RAM, 128GB storage, 5000mAh battery.", imageUrl: "https://picsum.photos/seed/mob001/600/400" },
  { productId: "MOB002", categoryName: "Mobile Phones", name: "Galaxy M Lite", price: 15999, description: "AMOLED display with powerful processor.", imageUrl: "https://picsum.photos/seed/mob002/600/400" },
  { productId: "MOB003", categoryName: "Mobile Phones", name: "Pixel Lite 5G", price: 28999, description: "Clean Android experience with excellent camera.", imageUrl: "https://picsum.photos/seed/mob003/600/400" },
  { productId: "MOB004", categoryName: "Mobile Phones", name: "iFruit Mini", price: 49999, description: "Compact premium smartphone.", imageUrl: "https://picsum.photos/seed/mob004/600/400" },
  { productId: "MOB005", categoryName: "Mobile Phones", name: "RedPlus Note", price: 18999, description: "Fast charging and large display.", imageUrl: "https://picsum.photos/seed/mob005/600/400" },
  { productId: "MOB006", categoryName: "Mobile Phones", name: "OneMax Nord", price: 23999, description: "Smooth display and strong performance.", imageUrl: "https://picsum.photos/seed/mob006/600/400" },
  { productId: "MOB007", categoryName: "Mobile Phones", name: "Budget Smart 4G", price: 7999, description: "Affordable smartphone for daily use.", imageUrl: "https://picsum.photos/seed/mob007/600/400" },

  // Makeup
  { productId: "MAKE001", categoryName: "Makeup", name: "Matte Lipstick", price: 499, description: "Long-lasting matte lipstick.", imageUrl: "https://picsum.photos/seed/make001/600/400" },
  { productId: "MAKE002", categoryName: "Makeup", name: "Liquid Foundation", price: 899, description: "Smooth coverage foundation.", imageUrl: "https://picsum.photos/seed/make002/600/400" },
  { productId: "MAKE003", categoryName: "Makeup", name: "Eyeliner Pen", price: 299, description: "Water-resistant eyeliner pen.", imageUrl: "https://picsum.photos/seed/make003/600/400" },
  { productId: "MAKE004", categoryName: "Makeup", name: "Mascara Volume Boost", price: 599, description: "Adds volume and curl to lashes.", imageUrl: "https://picsum.photos/seed/make004/600/400" },
  { productId: "MAKE005", categoryName: "Makeup", name: "Compact Powder", price: 399, description: "Lightweight compact powder.", imageUrl: "https://picsum.photos/seed/make005/600/400" },
  { productId: "MAKE006", categoryName: "Makeup", name: "Blush Palette", price: 699, description: "Soft blush shades for natural glow.", imageUrl: "https://picsum.photos/seed/make006/600/400" },
  { productId: "MAKE007", categoryName: "Makeup", name: "Makeup Brush Kit", price: 999, description: "Complete brush kit for makeup application.", imageUrl: "https://picsum.photos/seed/make007/600/400" },

  // Grocery
  { productId: "GROC001", categoryName: "Grocery", name: "Basmati Rice 5kg", price: 699, description: "Premium long-grain basmati rice.", imageUrl: "https://picsum.photos/seed/groc001/600/400" },
  { productId: "GROC002", categoryName: "Grocery", name: "Wheat Flour 5kg", price: 299, description: "Fresh chakki atta for daily meals.", imageUrl: "https://picsum.photos/seed/groc002/600/400" },
  { productId: "GROC003", categoryName: "Grocery", name: "Sunflower Oil 1L", price: 159, description: "Refined sunflower cooking oil.", imageUrl: "https://picsum.photos/seed/groc003/600/400" },
  { productId: "GROC004", categoryName: "Grocery", name: "Toor Dal 1kg", price: 189, description: "High-quality protein-rich dal.", imageUrl: "https://picsum.photos/seed/groc004/600/400" },
  { productId: "GROC005", categoryName: "Grocery", name: "Sugar 1kg", price: 55, description: "Fine grain sugar.", imageUrl: "https://picsum.photos/seed/groc005/600/400" },
  { productId: "GROC006", categoryName: "Grocery", name: "Tea Powder 500g", price: 249, description: "Strong aromatic tea powder.", imageUrl: "https://picsum.photos/seed/groc006/600/400" },
  { productId: "GROC007", categoryName: "Grocery", name: "Salt 1kg", price: 25, description: "Iodized cooking salt.", imageUrl: "https://picsum.photos/seed/groc007/600/400" },

  // Electronics
  { productId: "ELEC001", categoryName: "Electronics", name: "Bluetooth Earbuds", price: 1499, description: "Wireless earbuds with charging case.", imageUrl: "https://picsum.photos/seed/elec001/600/400" },
  { productId: "ELEC002", categoryName: "Electronics", name: "Power Bank 10000mAh", price: 999, description: "Fast-charging portable power bank.", imageUrl: "https://picsum.photos/seed/elec002/600/400" },
  { productId: "ELEC003", categoryName: "Electronics", name: "Smart Speaker", price: 2499, description: "Voice-enabled smart speaker.", imageUrl: "https://picsum.photos/seed/elec003/600/400" },
  { productId: "ELEC004", categoryName: "Electronics", name: "USB-C Cable", price: 199, description: "Durable fast charging cable.", imageUrl: "https://picsum.photos/seed/elec004/600/400" },
  { productId: "ELEC005", categoryName: "Electronics", name: "Wireless Mouse", price: 599, description: "Smooth wireless mouse for laptop.", imageUrl: "https://picsum.photos/seed/elec005/600/400" },
  { productId: "ELEC006", categoryName: "Electronics", name: "Laptop Stand", price: 899, description: "Adjustable laptop stand.", imageUrl: "https://picsum.photos/seed/elec006/600/400" },
  { productId: "ELEC007", categoryName: "Electronics", name: "LED Desk Lamp", price: 799, description: "Rechargeable LED study lamp.", imageUrl: "https://picsum.photos/seed/elec007/600/400" },

  // Bags
  { productId: "BAG001", categoryName: "Bags", name: "Travel Backpack", price: 1999, description: "Spacious backpack for travel.", imageUrl: "https://picsum.photos/seed/bag001/600/400" },
  { productId: "BAG002", categoryName: "Bags", name: "Laptop Bag", price: 1499, description: "Protective laptop bag with compartments.", imageUrl: "https://picsum.photos/seed/bag002/600/400" },
  { productId: "BAG003", categoryName: "Bags", name: "School Bag", price: 999, description: "Durable school bag for students.", imageUrl: "https://picsum.photos/seed/bag003/600/400" },
  { productId: "BAG004", categoryName: "Bags", name: "Handbag", price: 1299, description: "Stylish handbag for daily use.", imageUrl: "https://picsum.photos/seed/bag004/600/400" },
  { productId: "BAG005", categoryName: "Bags", name: "Gym Duffel Bag", price: 1199, description: "Large duffel bag for gym and sports.", imageUrl: "https://picsum.photos/seed/bag005/600/400" },
  { productId: "BAG006", categoryName: "Bags", name: "Sling Bag", price: 699, description: "Compact sling bag for essentials.", imageUrl: "https://picsum.photos/seed/bag006/600/400" },
  { productId: "BAG007", categoryName: "Bags", name: "Trolley Bag", price: 3499, description: "Hard-shell trolley bag for travel.", imageUrl: "https://picsum.photos/seed/bag007/600/400" },

  // Watches
  { productId: "WATCH001", categoryName: "Watches", name: "Classic Analog Watch", price: 1999, description: "Elegant analog wrist watch.", imageUrl: "https://picsum.photos/seed/watch001/600/400" },
  { productId: "WATCH002", categoryName: "Watches", name: "Smart Fitness Watch", price: 2999, description: "Tracks steps, heart rate and notifications.", imageUrl: "https://picsum.photos/seed/watch002/600/400" },
  { productId: "WATCH003", categoryName: "Watches", name: "Leather Strap Watch", price: 2499, description: "Premium leather strap watch.", imageUrl: "https://picsum.photos/seed/watch003/600/400" },
  { productId: "WATCH004", categoryName: "Watches", name: "Digital Sports Watch", price: 999, description: "Water-resistant sports watch.", imageUrl: "https://picsum.photos/seed/watch004/600/400" },
  { productId: "WATCH005", categoryName: "Watches", name: "Metal Chain Watch", price: 2199, description: "Stylish metal chain watch.", imageUrl: "https://picsum.photos/seed/watch005/600/400" },
  { productId: "WATCH006", categoryName: "Watches", name: "Kids Digital Watch", price: 499, description: "Colorful digital watch for kids.", imageUrl: "https://picsum.photos/seed/watch006/600/400" },
  { productId: "WATCH007", categoryName: "Watches", name: "Luxury Gold Watch", price: 5999, description: "Premium gold-tone watch.", imageUrl: "https://picsum.photos/seed/watch007/600/400" },

  // Home Decor
  { productId: "HOME001", categoryName: "Home Decor", name: "Wall Clock", price: 799, description: "Modern wall clock for living room.", imageUrl: "https://picsum.photos/seed/home001/600/400" },
  { productId: "HOME002", categoryName: "Home Decor", name: "Table Lamp", price: 1299, description: "Decorative table lamp.", imageUrl: "https://picsum.photos/seed/home002/600/400" },
  { productId: "HOME003", categoryName: "Home Decor", name: "Flower Vase", price: 599, description: "Ceramic flower vase.", imageUrl: "https://picsum.photos/seed/home003/600/400" },
  { productId: "HOME004", categoryName: "Home Decor", name: "Wall Painting", price: 1499, description: "Abstract wall painting.", imageUrl: "https://picsum.photos/seed/home004/600/400" },
  { productId: "HOME005", categoryName: "Home Decor", name: "Cushion Covers Set", price: 499, description: "Set of 5 cushion covers.", imageUrl: "https://picsum.photos/seed/home005/600/400" },
  { productId: "HOME006", categoryName: "Home Decor", name: "Decorative Candles", price: 399, description: "Scented decorative candles.", imageUrl: "https://picsum.photos/seed/home006/600/400" },
  { productId: "HOME007", categoryName: "Home Decor", name: "Indoor Plant Pot", price: 699, description: "Stylish indoor plant pot.", imageUrl: "https://picsum.photos/seed/home007/600/400" },

  // Books
  { productId: "BOOK001", categoryName: "Books", name: "Atomic Habits", price: 399, description: "Popular self-improvement book.", imageUrl: "https://picsum.photos/seed/book001/600/400" },
  { productId: "BOOK002", categoryName: "Books", name: "Rich Dad Poor Dad", price: 299, description: "Personal finance classic.", imageUrl: "https://picsum.photos/seed/book002/600/400" },
  { productId: "BOOK003", categoryName: "Books", name: "Clean Code", price: 699, description: "Programming best practices book.", imageUrl: "https://picsum.photos/seed/book003/600/400" },
  { productId: "BOOK004", categoryName: "Books", name: "JavaScript Guide", price: 499, description: "Beginner-friendly JavaScript book.", imageUrl: "https://picsum.photos/seed/book004/600/400" },
  { productId: "BOOK005", categoryName: "Books", name: "The Psychology of Money", price: 349, description: "Book about money behavior.", imageUrl: "https://picsum.photos/seed/book005/600/400" },
  { productId: "BOOK006", categoryName: "Books", name: "Deep Work", price: 449, description: "Focus and productivity book.", imageUrl: "https://picsum.photos/seed/book006/600/400" },
  { productId: "BOOK007", categoryName: "Books", name: "System Design Basics", price: 599, description: "Beginner system design guide.", imageUrl: "https://picsum.photos/seed/book007/600/400" }
];

function generateImageUrl(name, category) {
  const categoryColors = {
    "Shoes": "2c3e50",
    "Clothing": "e74c3c",
    "Cooking Utensils": "f39c12",
    "Mobile Phones": "3498db",
    "Makeup": "e91e63",
    "Grocery": "27ae60",
    "Electronics": "9b59b6",
    "Bags": "795548",
    "Watches": "607d8b",
    "Home Decor": "ff9800",
    "Books": "3f51b5"
  };
  const color = categoryColors[category] || "607d8b";
  const shortName = name.length > 22 ? name.substring(0, 22) + ".." : name;
  return `https://placehold.co/400x400/${color}/white/png?text=${encodeURIComponent(shortName)}`;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing categories and products.");

    // Insert categories
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${insertedCategories.length} categories.`);

    // Build category name -> _id map
    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Map products to use ObjectId references
    const productsToInsert = productsData.map((p) => ({
      productId: p.productId,
      category: categoryMap[p.categoryName],
      name: p.name,
      price: p.price,
      description: p.description,
      imageUrl: generateImageUrl(p.name, p.categoryName),
      isActive: true,
      gender: p.gender,
      clothingType: p.clothingType,
      size: p.size,
      color: p.color
    }));

    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`Inserted ${insertedProducts.length} products.`);

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();

