import { Product } from "../models/Product.js";
import { ObjectId } from "mongodb";
import { uploadToImgbb } from "../middlewares/imgbbMiddleware.js";

const sanitizeImgbbUrl = (url) => url?.replace("i.ibb.co.com", "i.ibb.co");

export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filters = {};
    if (search) filters.search = search;
    if (category) {
      // Split comma-separated categories and trim whitespace
      const categories = category.split(",").map((cat) => cat.trim());
      filters.category = { $in: categories }; // Use $in operator for multiple categories
    }

    const products = await Product.findAll(filters);
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const files = req.files;

    productData.images = [];
    productData.chartImage = null;

    // Handle image array
    const imageFiles = files?.images || [];
    if (imageFiles.length > 0) {
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const url = await uploadToImgbb(file);
          return sanitizeImgbbUrl(url);
        })
      );
      productData.images = imageUrls;
    }

    // Handle single chartImage
    const chartFile = files?.chartImage?.[0];
    if (chartFile) {
      const url = await uploadToImgbb(chartFile);
      productData.chartImage = sanitizeImgbbUrl(url);
    }

    // Normalize sizes/colors
    if (!Array.isArray(productData.sizes)) {
      productData.sizes = [productData.sizes];
    }
    if (!Array.isArray(productData.colors)) {
      productData.colors = [productData.colors];
    }

    const result = await Product.create(productData);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    const productData = req.body;
    const files = req.files;

    // Parse and normalize existing images from the frontend
    const existingImages = JSON.parse(productData.existingImages || "[]");
    let finalImages = existingImages;

    // Handle uploaded product images
    const newImageFiles = files?.images || [];
    if (newImageFiles.length > 0) {
      const uploadedUrls = await Promise.all(
        newImageFiles.map(async (file) => {
          const url = await uploadToImgbb(file);
          return sanitizeImgbbUrl(url);
        })
      );
      finalImages = [...existingImages, ...uploadedUrls];
    }

    // Handle uploaded chartImage (overwrite old one if present)
    let chartImageUrl = productData.existingChartImage || null;
    const chartImageFile = files?.chartImage?.[0];
    if (chartImageFile) {
      const url = await uploadToImgbb(chartImageFile);
      chartImageUrl = sanitizeImgbbUrl(url);
    }

    // Construct update payload
    const updateData = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      category: productData.category,
      stock: parseInt(productData.stock),
      isPreOrder: productData.isPreOrder === "true",
      sizes: JSON.parse(productData.sizes),
      colors: JSON.parse(productData.colors),
      images: finalImages,
      chartImage: chartImageUrl,
      updatedAt: new Date(),
    };

    const result = await Product.update(productId, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Error updating product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    const result = await Product.delete(productId);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

export const uploadChartImage = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No chart image file provided" });
    }

    const chartImageUrl = await uploadToImgbb(file);
    const sanitizedChartImageUrl = sanitizeImgbbUrl(chartImageUrl);

    const result = await Product.update(productId, {
      chartImage: sanitizedChartImageUrl,
      updatedAt: new Date(),
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Chart image uploaded successfully",
      chartImage: sanitizedChartImageUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading chart image",
      error: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Product.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    });
  }
};
