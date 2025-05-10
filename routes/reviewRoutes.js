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

const router = express.Router();

router.post("/", protect, createReview);
router.get("/product/:productId", getReviewsByProductId);
router.get("/:id", getReviewById);
router.get("/", getAllReviews);
router.delete("/:id", protect, deleteReview);
router.put("/:id", protect, updateReview);

export default router;
