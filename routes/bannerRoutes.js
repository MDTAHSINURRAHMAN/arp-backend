import express from "express";
import { getBanner, updateBanner } from "../controllers/bannerController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getBanner); // Get current banner
router.put("/", protect, updateBanner); // Update banner

export default router;
