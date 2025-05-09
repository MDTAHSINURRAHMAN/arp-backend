import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", protect, updateOrderStatus);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

export default router;
