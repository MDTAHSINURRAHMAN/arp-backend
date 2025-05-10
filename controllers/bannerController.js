import { Banner } from "../models/Banner.js";

export const getBanner = async (req, res) => {
  try {
    const banner = await Banner.find();
    if (!banner || !banner.image) {
      return res.status(200).json({ imageUrl: null });
    }
    return res.status(200).json({
      image: banner.image,
      imageUrl: banner.image,
      updatedAt: banner.updatedAt,
    });
  } catch (error) {
    console.error("getBanner error:", error.message);
    return res.status(500).json({ message: "Failed to fetch banner" });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image URL provided" });
    }
    const result = await Banner.upsert({
      image,
      updatedAt: new Date(),
    });
    return res.status(200).json({
      message: "Banner updated successfully",
      image,
      imageUrl: image,
    });
  } catch (error) {
    console.error("❌ updateBanner error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to update banner", error: error.message });
  }
};
