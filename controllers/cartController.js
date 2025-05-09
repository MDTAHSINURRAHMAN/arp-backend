import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

const collection = "carts";

const calculateShippingDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date;
};

// GET /api/cart/:cartId
export const getCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const db = getDB();
    let cart = await db.collection(collection).findOne({ cartId });

    if (!cart) {
      cart = {
        cartId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection(collection).insertOne(cart);
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// POST /api/cart/:cartId/add
export const addToCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const {
      productId,
      name,
      image,
      size,
      availableSizes,
      color,
      availableColors,
      quantity,
      price,
    } = req.body;

    const db = getDB();
    let cart = await db.collection(collection).findOne({ cartId });

    const newItem = {
      _id: new ObjectId(),
      productId: new ObjectId(productId),
      name,
      image,
      shippingDate: calculateShippingDate(),
      size,
      availableSizes,
      color,
      availableColors,
      quantity,
      price,
      total: price * quantity,
      addedAt: new Date(),
    };

    if (!cart) {
      cart = {
        cartId,
        items: [newItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection(collection).insertOne(cart);
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].total =
          cart.items[existingItemIndex].quantity * price;
      } else {
        cart.items.push(newItem);
      }

      await db.collection(collection).updateOne(
        { cartId },
        {
          $set: {
            items: cart.items,
            updatedAt: new Date(),
          },
        }
      );
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart", error: error.message });
  }
};

// PATCH /api/cart/:cartId/item/:itemId
export const updateCartItem = async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    const { size, color, quantity } = req.body;
    const db = getDB();

    let cart = await db.collection(collection).findOne({ cartId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.map((item) => {
      if (item._id.toString() === itemId) {
        if (size) item.size = size;
        if (color) item.color = color;
        if (quantity) {
          item.quantity = quantity;
          item.total = item.price * quantity;
        }
      }
      return item;
    });

    await db.collection(collection).updateOne(
      { cartId },
      { $set: { items: cart.items, updatedAt: new Date() } }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item", error: error.message });
  }
};

// POST /api/cart/:cartId/add-size/:productId
export const addSizeVariant = async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const { size, quantity = 1 } = req.body;
    const db = getDB();

    let cart = await db.collection(collection).findOne({ cartId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const baseItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!baseItem) return res.status(404).json({ message: "Product not found in cart" });

    const newItem = {
      ...baseItem,
      _id: new ObjectId(),
      size,
      quantity,
      total: quantity * baseItem.price,
      shippingDate: calculateShippingDate(),
      addedAt: new Date(),
    };

    cart.items.push(newItem);

    await db.collection(collection).updateOne(
      { cartId },
      { $set: { items: cart.items, updatedAt: new Date() } }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding size variant", error: error.message });
  }
};

// DELETE /api/cart/:cartId/item/:itemId
export const deleteCartItem = async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    const db = getDB();

    let cart = await db.collection(collection).findOne({ cartId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await db.collection(collection).updateOne(
      { cartId },
      { $set: { items: cart.items, updatedAt: new Date() } }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error deleting cart item", error: error.message });
  }
};

// DELETE /api/cart/:cartId
export const clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const db = getDB();

    let cart = await db.collection(collection).findOne({ cartId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await db.collection(collection).updateOne(
      { cartId },
      { $set: { items: [], updatedAt: new Date() } }
    );

    res.json({ message: "Cart cleared", cartId });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};

// GET /api/cart/new
export const generateCartId = async (req, res) => {
  try {
    const db = getDB();
    const cartId = uuidv4();
    const newCart = {
      cartId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection(collection).insertOne(newCart);
    res.json({ cartId, cart: newCart });
  } catch (error) {
    res.status(500).json({ message: "Error generating cart ID", error: error.message });
  }
};
