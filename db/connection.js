const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || "mongodb+srv://swathitechgrowth_db_user:w1PDLtwElPVG1muz@cluster0.3ofzsav.mongodb.net/?appName=Cluster0";

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
