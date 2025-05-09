import { getDB } from "../config/db.js";

const collection = "settings";

export const Setting = {
  async get() {
    const db = getDB();
    const settings = await db.collection(collection).findOne({});
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = {
        promoText: "",
        socialLinks: {
          instagram: "",
          facebook: "",
          whatsapp: "",
          x: "",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection(collection).insertOne(defaultSettings);
      return defaultSettings;
    }
    return settings;
  },

  async update(updateData) {
    const db = getDB();
    return await db.collection(collection).updateOne(
      {},
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  },
};
