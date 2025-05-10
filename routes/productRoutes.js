import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadChartImage,
  getAllCategories,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", getAllProducts);
router.get("/categories", getAllCategories);
router.get("/:id", getProductById);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.post("/:id/chart-image", protect, uploadChartImage);

export default router;
