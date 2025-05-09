import { Setting } from "../models/Setting.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.get();
    res.status(200).json(settings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching settings", error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const result = await Setting.update(req.body);
    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating settings", error: error.message });
  }
};
