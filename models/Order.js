import { getDB } from "../config/db.js";

const collection = "orders";

export const Order = {
  async create(orderData) {
    const db = getDB();
    const result = await db.collection(collection).insertOne({
      ...orderData,
      status: "unpaid",
      subtotal: orderData.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ),
      transactionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  async findById(id) {
    const db = getDB();
    return await db.collection(collection).findOne({ _id: id });
  },

  async findAll() {
    const db = getDB();
    return await db.collection(collection).find().toArray();
  },

  async updateStatus(id, status, transactionId = null) {
    const db = getDB();
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    return await db
      .collection(collection)
      .updateOne({ _id: id }, { $set: updateData });
  },

  async delete(id) {
    const db = getDB();
    return await db.collection(collection).deleteOne({ _id: id });
  },

  async update(id, updateData) {
    const db = getDB();
    const allowedUpdates = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (updateData.items) {
      allowedUpdates.subtotal = updateData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }

    return await db
      .collection(collection)
      .updateOne({ _id: id }, { $set: allowedUpdates });
  },

  async search(query) {
    const db = getDB();
    const searchRegex = new RegExp(query, "i");
    return await db
      .collection(collection)
      .find({
        $or: [
          { "customer.firstName": searchRegex },
          { "customer.lastName": searchRegex },
          { "customer.email": searchRegex },
          { "customer.phone": searchRegex },
          { "customer.address": searchRegex },
          { "customer.city": searchRegex },
          { "customer.discountCode": searchRegex },
        ],
      })
      .toArray();
  },
};
