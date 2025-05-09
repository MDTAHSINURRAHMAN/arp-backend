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
import { upload } from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", getAllProducts);
router.get("/categories", getAllCategories);
router.get("/:id", getProductById);
router.post(
  "/",
  protect,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "chartImage", maxCount: 1 },
  ]),
  createProduct
);
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "chartImage", maxCount: 1 },
  ]),
  updateProduct
);
router.delete("/:id", protect, deleteProduct);
router.post(
  "/:id/chart-image",
  protect,
  upload.single("chartImage"),
  uploadChartImage
);

export default router;
