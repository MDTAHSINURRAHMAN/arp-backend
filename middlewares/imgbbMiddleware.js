import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

/**
 * Uploads a file (from multer) to imgbb and returns the image URL.
 * @param {Object} file - Multer file object (with buffer, mimetype, originalname)
 * @returns {Promise<string>} - The imgbb image URL
 */
export async function uploadToImgbb(file) {
  if (!IMGBB_API_KEY) throw new Error("IMGBB_API_KEY is not set in .env");
  if (!file || !file.buffer) throw new Error("No file buffer provided");

  // Convert buffer to base64
  const base64Image = file.buffer.toString("base64");

  const formData = new URLSearchParams();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", base64Image);
  formData.append("name", file.originalname);

  try {
    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error("Invalid imgbb response");
    }
  } catch (error) {
    throw new Error(
      `Error uploading to imgbb: ${
        error.response?.data?.error?.message || error.message
      }`
    );
  }
}
