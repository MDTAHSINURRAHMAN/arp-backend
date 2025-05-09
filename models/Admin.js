import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Create a new admin (already hashed password)
export const createAdmin = async ({ username, email, password }) => {
  const db = getDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.collection("admins").insertOne({
    username,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });
  return result.insertedId;
};

// Find admin by username
export const findAdminByUsername = async (username) => {
  const db = getDB();
  return await db.collection("admins").findOne({ username });
};

// Find admin by ID
export const findAdminById = async (id) => {
  const db = getDB();
  return await db.collection("admins").findOne({ _id: new ObjectId(id) });
};

// Compare password
export const comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};



