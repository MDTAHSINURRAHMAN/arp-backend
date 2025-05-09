import { getDB } from "../config/db.js";

const collection = "products";

export const Product = {
  async create(productData) {
    const db = getDB();
    const result = await db.collection(collection).insertOne({
      ...productData,
      images: productData.images || [],
      chartImage: productData.chartImage || null, // ✅ Add this line
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  async findById(id) {
    const db = getDB();
    return await db.collection(collection).findOne({ _id: id });
  },

  async findAll(filters = {}) {
    const db = getDB();

    const query = {};

    if (filters.search) {
      query.name = { $regex: filters.search, $options: "i" }; // partial, case-insensitive match
    }

    if (filters.category) {
      query.category = filters.category; // exact match
    }

    return await db.collection(collection).find(query).toArray();
  },

  async update(id, updateData) {
    const db = getDB();
    return await db.collection(collection).updateOne(
      { _id: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
  },

  async delete(id) {
    const db = getDB();
    return await db.collection(collection).deleteOne({ _id: id });
  },

  async getAllCategories() {
    const db = getDB();
    return await db.collection(collection).distinct("category");
  },
};
