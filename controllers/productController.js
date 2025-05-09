import { Product } from "../models/Product.js";
import { ObjectId } from "mongodb";
import { uploadToS3, getSignedImageUrl } from "../services/s3Service.js";

function normalizeS3Key(key) {
  return typeof key === "string" ? key.replace(/^\//, "") : key;
}

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

    // Get signed URLs
    const productsWithSignedUrls = await Promise.all(
      products.map(async (product) => {
        if (product.images && product.images.length > 0) {
          const imageKeys = product.images.map(normalizeS3Key);
          const signedUrls = await Promise.all(
            imageKeys.map((key) => getSignedImageUrl(key))
          );
          return { ...product, images: signedUrls };
        }
        return product;
      })
    );

    res.status(200).json(productsWithSignedUrls);
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

    // Get signed URLs for images
    if (product.images && product.images.length > 0) {
      const imageKeys = product.images.map(normalizeS3Key);
      const signedUrls = await Promise.all(
        imageKeys.map((key) => getSignedImageUrl(key))
      );
      product.images = signedUrls;
    }
    // Get signed URL for chartImage
    if (product.chartImage) {
      product.chartImage = await getSignedImageUrl(product.chartImage);
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

    // ✅ Handle image array
    const imageFiles = files?.images || [];
    if (imageFiles.length > 0) {
      const imageKeys = await Promise.all(
        imageFiles.map(async (file) => {
          const key = `products/${Date.now()}-${file.originalname}`;
          return await uploadToS3(file, key);
        })
      );
      productData.images = imageKeys;
    }

    // ✅ Handle single chartImage
    const chartFile = files?.chartImage?.[0];
    if (chartFile) {
      const key = `products/chartImages/${Date.now()}-${
        chartFile.originalname
      }`;
      productData.chartImage = await uploadToS3(chartFile, key);
    }

    // ✅ Normalize sizes/colors
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

    // Parse existing images from the frontend
    // Parse and normalize existing images from the frontend
    const existingImages = JSON.parse(productData.existingImages || "[]").map(
      normalizeS3Key
    );
    let finalImages = existingImages;

    // ✅ Handle uploaded product images
    const newImageFiles = files?.images || [];
    if (newImageFiles.length > 0) {
      const uploadedKeys = await Promise.all(
        newImageFiles.map(async (file) => {
          const key = `products/${Date.now()}-${file.originalname}`;
          return await uploadToS3(file, key);
        })
      );
      finalImages = [...existingImages, ...uploadedKeys];
    }

    // ✅ Handle uploaded chartImage (overwrite old one if present)
    let chartImageKey = productData.existingChartImage || null;
    const chartImageFile = files?.chartImage?.[0];
    if (chartImageFile) {
      const key = `products/chartImages/${Date.now()}-${
        chartImageFile.originalname
      }`;
      chartImageKey = await uploadToS3(chartImageFile, key);
    }

    // ✅ Construct update payload
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
      chartImage: chartImageKey,
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

    const key = `products/chartImages/${Date.now()}-${file.originalname}`;
    const chartImageKey = await uploadToS3(file, key);

    // ✅ Use your existing model method
    const result = await Product.update(productId, {
      chartImage: chartImageKey,
      updatedAt: new Date(),
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Chart image uploaded successfully",
      chartImage: chartImageKey,
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
