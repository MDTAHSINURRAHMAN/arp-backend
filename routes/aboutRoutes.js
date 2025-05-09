import express from "express";
import {
  getAbout,
  createAbout,
  updateAbout,
  deleteAbout,
} from "../controllers/aboutController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


// GET: Fetch about page content
router.get("/", getAbout);

// POST: Create a new about page content
router.post("/", protect, createAbout);

// DELETE: Delete about page content
router.delete("/", protect, deleteAbout);

// PUT: Update about page content (single document)
router.put("/", protect, updateAbout);

export default router;
