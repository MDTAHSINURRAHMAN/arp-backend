import { getDB } from "../config/db.js";
import { About } from "../models/About.js";

// Get About content
export const getAbout = async (req, res) => {
  try {
    const db = getDB();
    const about = await db.collection("about").findOne({});
    return res.status(200).json(about || null); // Only one response
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update or create About content
export const updateAbout = async (req, res) => {
  try {
    const db = getDB();
    const { brandMessage, missionPoints, email, address, phone, artistSay } =
      req.body;
    let image2 = req.body.image2; // Only use the URL provided by the user

    // Ensure missionPoints is always an array
    let missionPointsParsed = missionPoints;
    if (typeof missionPoints === "string") {
      try {
        missionPointsParsed = JSON.parse(missionPoints);
      } catch (e) {
        missionPointsParsed = [];
      }
    }

    console.log(
      "Parsed missionPoints:",
      missionPointsParsed,
      typeof missionPointsParsed
    );

    const result = await db.collection("about").updateOne(
      {},
      {
        $set: {
          brandMessage,
          missionPoints: missionPointsParsed,
          email,
          address,
          phone,
          artistSay,
          image2,
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
    const { brandMessage, missionPoints, email, address, phone, artistSay } =
      req.body;
    let image2 = req.body.image2; // Only use the URL provided by the user

    let missionPointsParsed = missionPoints;
    if (typeof missionPoints === "string") {
      try {
        missionPointsParsed = JSON.parse(missionPoints);
        console.log(
          "missionPoints is a string, parsed as:",
          missionPointsParsed
        );
      } catch (e) {
        missionPointsParsed = [];
        console.log(
          "Failed to parse missionPoints, fallback to empty array:",
          missionPointsParsed
        );
      }
    } else {
      console.log("missionPoints is already an array:", missionPointsParsed);
    }

    const result = await db.collection("about").insertOne({
      brandMessage,
      missionPoints: missionPointsParsed,
      email,
      address,
      phone,
      artistSay,
      image2,
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
