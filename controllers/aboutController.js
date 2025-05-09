import { getDB } from "../config/db.js";
import { About } from "../models/About.js";

// Get About content
export const getAbout = async (req, res) => {
  try {
    const db = getDB();
    const about = await db.collection("about").findOne({});
    res.status(200).json(about || null); // ✅ instead of 404

    res.json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update or create About content
export const updateAbout = async (req, res) => {
  try {
    const db = getDB();
    const { brandMessage, missionPoints, email, address, phone } = req.body;

    const result = await db.collection("about").updateOne(
      {},
      {
        $set: {
          brandMessage,
          missionPoints,
          email,
          address,
          phone,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      const updated = await db.collection("about").findOne({});
      res.json(updated);
    } else {
      res.status(200).json({ message: "No changes made to About content" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create About content
export const createAbout = async (req, res) => {
  try {
    const db = getDB();
    const { brandMessage, missionPoints, email, address, phone } = req.body;

    const result = await db.collection("about").insertOne({
      brandMessage,
      missionPoints,
      email,
      address,
      phone,
      createdAt: new Date(),
    });

    res.status(201).json(result.ops?.[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete About content
export const deleteAbout = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("about").deleteOne({});

    if (result.deletedCount > 0) {
      res.json({ message: "About content deleted successfully" });
    } else {
      res.status(404).json({ message: "About content not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
