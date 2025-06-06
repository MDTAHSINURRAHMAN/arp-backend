import { Story } from "../models/Story.js";
import { ObjectId } from "mongodb";

// GET /api/story
export const getStory = async (req, res) => {
  try {
    const stories = await Story.findAll();
    if (!stories || stories.length === 0) {
      return res.status(200).json(null);
    }
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stories",
      error: error.message,
    });
  }
};

// POST /api/story
export const createStory = async (req, res) => {
  try {
    const { image, content: contentRaw } = req.body;
    let content;
    // Only parse if it's a string, otherwise use as is
    if (typeof contentRaw === "string") {
      content = JSON.parse(contentRaw || "[]");
    } else {
      content = contentRaw || [];
    }
    if (!image) {
      return res.status(400).json({ message: "Image URL is required" });
    }
    if (!Array.isArray(content) || content.length === 0) {
      return res
        .status(400)
        .json({ message: "Content must be a non-empty array" });
    }
    const newStory = { image, content };
    const result = await Story.create(newStory);
    res.status(201).json({
      message: "Story created successfully",
      storyId: result.insertedId,
      story: newStory,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create story",
      error: error.message,
    });
  }
};

// PUT /api/story/:id
export const updateStory = async (req, res) => {
  try {
    const storyId = req.params.id;

    if (!ObjectId.isValid(storyId)) {
      return res.status(400).json({ message: "Invalid story ID format" });
    }

    const { image, content: contentRaw } = req.body;
    let content;
    if (typeof contentRaw === "string") {
      content = JSON.parse(contentRaw || "[]");
    } else {
      content = contentRaw || [];
    }
    if (!Array.isArray(content) || content.length === 0) {
      return res
        .status(400)
        .json({ message: "Content must be a non-empty array" });
    }
    const updateData = { content };
    if (image) {
      updateData.image = image;
    }

    const result = await Story.update(storyId, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    const updated = await Story.findById(storyId);

    res.status(200).json({
      message: "Story updated successfully",
      story: updated,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update story",
      error: error.message,
    });
  }
};

// DELETE /api/story/:id
export const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;

    if (!ObjectId.isValid(storyId)) {
      return res.status(400).json({ message: "Invalid story ID format" });
    }

    const result = await Story.delete(storyId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete story",
      error: error.message,
    });
  }
};

export default {
  getStory,
  createStory,
  updateStory,
  deleteStory,
};
