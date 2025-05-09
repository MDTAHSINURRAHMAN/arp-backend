import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  addSizeVariant,
  deleteCartItem,
  clearCart,
  generateCartId,
} from "../controllers/cartController.js";

const router = express.Router();

// Generate new cart ID
router.post("/generate", generateCartId);

// Get cart
router.get("/:cartId", getCart);

// Add item to cart
router.post("/:cartId/add", addToCart);

// Update cart item
router.patch("/:cartId/item/:itemId", updateCartItem);

// Add same product with new size
router.post("/:cartId/add-size/:productId", addSizeVariant);

// Delete item from cart
router.delete("/:cartId/item/:itemId", deleteCartItem);

// Clear entire cart
router.delete("/:cartId", clearCart);

export default router;
