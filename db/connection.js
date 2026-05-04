const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || "mongodb+srv://prajjwal_setty:Prajjwal%4016!@cluster0.54iqom9.mongodb.net/whatsapp_commerce";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;