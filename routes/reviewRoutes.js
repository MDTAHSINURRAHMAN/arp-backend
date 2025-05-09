import express from "express";
import {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReviewById,
  getReviewsByProductId,
} from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createReview);
router.get("/product/:productId", getReviewsByProductId);
router.get("/:id", getReviewById);
router.get("/", getAllReviews);
router.delete("/:id", protect, deleteReview);
router.put("/:id", protect, upload.single("image"), updateReview);

export default router;
