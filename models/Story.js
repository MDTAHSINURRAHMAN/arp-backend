import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const collection = "story";

export const Story = {
  async create(storyData) {
    const db = getDB();
    const result = await db.collection(collection).insertOne({
      ...storyData,
      image: storyData.image || "", // S3 image URL
      content: storyData.content || [], // Array of title and description objects
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  async findAll() {
    const db = getDB();
    return await db.collection(collection).find().sort({ createdAt: -1 }).toArray();
  },

  async update(id, updateData) {
    const db = getDB();
    return await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
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
    return await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
  },
};

export default Story;
