// lib/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is undefined. Check your .env file");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI); // ✅ no extra options
    console.log("✅ Connected to MongoDB server");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected");
  });
};

export default connectDB;
