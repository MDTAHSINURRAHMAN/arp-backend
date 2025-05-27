import { Frame } from "../models/Frame.js";
import { ObjectId } from "mongodb";

export const getAllFrames = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filters = {};
    if (search) filters.search = search;
    if (category) {
      // Split comma-separated categories and trim whitespace
      const categories = category.split(",").map((cat) => cat.trim());
      filters.category = { $in: categories }; // Use $in operator for multiple categories
    }

    const frames = await Frame.findAll(filters);
    res.status(200).json(frames);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching frames", error: error.message });
  }
};

export const getFrameById = async (req, res) => {
  try {
    const frameId = new ObjectId(req.params.id);
    const frame = await Frame.findById(frameId);

    if (!frame) {
      return res.status(404).json({ message: "Frame not found" });
    }

    res.status(200).json(frame);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching frame", error: error.message });
  }
};

export const createFrame = async (req, res) => {
  try {
    const { images, ...otherFields } = req.body;
    // images: array of URLs
    const frameData = { ...otherFields, images };
    const result = await Frame.create(frameData);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Error creating frame",
      error: error.message,
    });
  }
};

export const updateFrame = async (req, res) => {
  try {
    const frameId = new ObjectId(req.params.id);
    const { images, ...otherFields } = req.body;
    const updateData = {
      ...otherFields,
      images,
      updatedAt: new Date(),
    };
    const result = await Frame.update(frameId, updateData);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Frame not found" });
    }
    res.status(200).json({ message: "Frame updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Error updating frame", error: error.message });
  }
};

export const deleteFrame = async (req, res) => {
  try {
    const frameId = new ObjectId(req.params.id);
    const result = await Frame.delete(frameId);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Frame not found" });
    }
    res.status(200).json({ message: "Frame deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting frame", error: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Frame.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

export const getAllSizes = async (req, res) => {
  try {
    const sizes = await Frame.getAllSizes();
    res.status(200).json(sizes);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sizes",
      error: error.message,
    });
  }
};

export const getAllColors = async (req, res) => {
  try {
    const colors = await Frame.getAllColors();
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching colors",
      error: error.message,
    });
  }
};
