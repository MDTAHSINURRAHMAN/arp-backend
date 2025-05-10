import express from "express";
import {
  getStory,
  createStory,
  updateStory,
  deleteStory,
} from "../controllers/storyController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getStory);

// Protected Routes (admin only)
router.post("/", protect, createStory);
router.put("/:id", protect, updateStory);
router.delete("/:id", protect, deleteStory);

export default router;
