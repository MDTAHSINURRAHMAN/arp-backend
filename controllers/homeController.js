import { Text } from "../models/Home.js";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

// Create a new text entry
export const createText = async (req, res) => {
  try {
    const result = await Text.create({
      text: req.body.text,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      whatsapp: req.body.whatsapp,
      pinterest: req.body.pinterest,
      behance: req.body.behance,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all text entries
export const getAllTexts = async (req, res) => {
  try {
    const texts = await Text.findAll();
    res.json(texts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a text entry
export const updateText = async (req, res) => {
  try {
    const db = getDB();
    const updateFields = {
      text: req.body.text ?? "",
      facebook: req.body.facebook ?? "",
      instagram: req.body.instagram ?? "",
      whatsapp: req.body.whatsapp ?? "",
      pinterest: req.body.pinterest ?? "",
      behance: req.body.behance ?? "",
      updatedAt: new Date(),
    };
    const result = await db
      .collection("home")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateFields });

    if (result.matchedCount > 0) {
      const updatedText = await Text.findById(req.params.id);
      res.json(updatedText);
    } else {
      res.status(404).json({ message: "Text not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a text entry
export const deleteText = async (req, res) => {
  try {
    const result = await Text.delete(req.params.id);
    if (result.deletedCount > 0) {
      res.json({ message: "Text deleted successfully" });
    } else {
      res.status(404).json({ message: "Text not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
