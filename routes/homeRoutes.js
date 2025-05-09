import express from "express";
import {
  createText,
  getAllTexts,
  updateText,
  deleteText,
} from "../controllers/homeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST: Create a new text entry
router.post("/", protect, createText);

// GET: Get all text entries
router.get("/", getAllTexts);

// PUT: Update a text entry by ID
router.put("/:id", protect, updateText);

// DELETE: Delete a text entry by ID
router.delete("/:id", protect, deleteText);

export default router;
