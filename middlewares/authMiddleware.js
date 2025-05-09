import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getDB();
    const admin = await db
      .collection("admins")
      .findOne({ _id: new ObjectId(decoded.id) });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
