// models/cart.js
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const collection = "carts";

export const Cart = {
  async getCart(cartId) {
    const db = getDB();
    return await db.collection(collection).findOne({ cartId });
  },

  async createCart(cartId) {
    const db = getDB();
    const cart = {
      cartId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection(collection).insertOne(cart);
    return cart;
  },

  async addOrUpdateItem(cartId, itemData) {
    const db = getDB();
    const cart = await db.collection(collection).findOne({ cartId });

    const shippingDate = new Date();
    shippingDate.setDate(shippingDate.getDate() + 3);

    const newItem = {
      _id: new ObjectId(),
      ...itemData,
      shippingDate,
      total: itemData.price * itemData.quantity,
      addedAt: new Date(),
    };

    if (!cart) {
      // If cart doesn't exist, create and add item
      await db.collection(collection).insertOne({
        cartId,
        items: [newItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { items: [newItem] };
    }

    // Check if same product with same size and color already exists
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === itemData.productId.toString() &&
        item.size === itemData.size &&
        item.color === itemData.color
    );

    if (existingItemIndex >= 0) {
      // Update quantity and total
      cart.items[existingItemIndex].quantity += itemData.quantity;
      cart.items[existingItemIndex].total =
        cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
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

    return { items: cart.items };
  },

  async updateItem(cartId, itemId, updates) {
    const db = getDB();
    const cart = await db.collection(collection).findOne({ cartId });

    if (!cart) return null;

    const items = cart.items.map((item) => {
      if (item._id.toString() === itemId.toString()) {
        const updated = {
          ...item,
          ...updates,
          total: (updates.price ?? item.price) * (updates.quantity ?? item.quantity),
        };
        return updated;
      }
      return item;
    });

    await db.collection(collection).updateOne(
      { cartId },
      {
        $set: {
          items,
          updatedAt: new Date(),
        },
      }
    );

    return { items };
  },

  async deleteItem(cartId, itemId) {
    const db = getDB();
    const cart = await db.collection(collection).findOne({ cartId });
    if (!cart) return null;

    const newItems = cart.items.filter((item) => item._id.toString() !== itemId);
    await db.collection(collection).updateOne(
      { cartId },
      { $set: { items: newItems, updatedAt: new Date() } }
    );

    return { items: newItems };
  },

  async clearCart(cartId) {
    const db = getDB();
    await db.collection(collection).updateOne(
      { cartId },
      { $set: { items: [], updatedAt: new Date() } }
    );
    return { items: [] };
  },
};
