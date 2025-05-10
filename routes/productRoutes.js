import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
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

export default router;
