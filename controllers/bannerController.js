import { Banner } from "../models/Banner.js";
import { uploadToImgbb } from "../middlewares/imgbbMiddleware.js";

const sanitizeImgbbUrl = (url) => url?.replace("i.ibb.co.com", "i.ibb.co");

export const getBanner = async (req, res) => {
  try {
    const banner = await Banner.find();

    if (!banner || !banner.image) {
      return res.status(200).json({ imageUrl: null });
    }

    // Sanitize the image URL
    const sanitizedImageUrl = sanitizeImgbbUrl(banner.image);

    // The image is now a direct imgbb URL
    return res.status(200).json({
      image: banner.image,
      imageUrl: sanitizedImageUrl,
      updatedAt: banner.updatedAt,
    });
  } catch (error) {
    console.error("❌ getBanner error:", error.message);
    return res.status(500).json({ message: "Failed to fetch banner" });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const imageUrl = await uploadToImgbb(file);
    const sanitizedImageUrl = sanitizeImgbbUrl(imageUrl);
    const result = await Banner.upsert({
      image: imageUrl,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      message: "Banner updated successfully",
      image: imageUrl,
      imageUrl: sanitizedImageUrl,
    });
  } catch (error) {
    console.error("❌ updateBanner error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to update banner", error: error.message });
  }
};
