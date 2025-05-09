import { getDB } from "../config/db.js";

const collection = "banner";

export const Banner = {
  async find() {
    const db = getDB();
    const banner = await db.collection(collection).findOne({});
    return banner;
  },

  async upsert(data) {
    const db = getDB();
    return await db.collection(collection).updateOne(
      {}, // empty filter to match any document
      { $set: data },
      { upsert: true } // creates a new document if none exists
    );
  },
};
