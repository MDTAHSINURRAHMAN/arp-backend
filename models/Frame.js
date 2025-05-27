import { getDB } from "../config/db.js";

const collection = "frames";

export const Frame = {
  async create(frameData) {
    const db = getDB();
    const result = await db.collection(collection).insertOne({
      ...frameData,
      images: frameData.images || [],
      sizes: frameData.sizes || [],
      colors: frameData.colors || [],
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

  async getAllSizes() {
    const db = getDB();
    const sizes = await db
      .collection(collection)
      .aggregate([
        { $unwind: "$sizes" },
        { $group: { _id: null, sizes: { $addToSet: "$sizes" } } },
        { $project: { _id: 0, sizes: 1 } },
      ])
      .toArray();
    return sizes[0]?.sizes || [];
  },

  async getAllColors() {
    const db = getDB();
    const colors = await db
      .collection(collection)
      .aggregate([
        { $unwind: "$colors" },
        { $group: { _id: null, colors: { $addToSet: "$colors" } } },
        { $project: { _id: 0, colors: 1 } },
      ])
      .toArray();
    return colors[0]?.colors || [];
  },
};
