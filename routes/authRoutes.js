import express from "express";
import {
  loginAdmin,
  getMe,
  logoutAdmin,
  registerAdmin,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);
router.post("/register", registerAdmin);

// Protected routes
router.post("/logout", protect, logoutAdmin);
router.get("/me", protect, getMe);

export default router;
