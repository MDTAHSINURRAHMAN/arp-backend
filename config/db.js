import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
let client;

export const connectDB = async () => {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("MongoDB connected successfully");
    return client.db();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!client) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return client.db();
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
};
