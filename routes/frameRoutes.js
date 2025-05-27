import express from "express";
import {
  getAllFrames,
  getFrameById,
  createFrame,
  updateFrame,
  deleteFrame,
  getAllCategories,
  getAllSizes,
  getAllColors,
} from "../controllers/frameController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", getAllFrames);
router.get("/categories", getAllCategories);
router.get("/sizes", getAllSizes);
router.get("/colors", getAllColors);
router.get("/:id", getFrameById);
router.post("/", protect, createFrame);
router.put("/:id", protect, updateFrame);
router.delete("/:id", protect, deleteFrame);

export default router;
