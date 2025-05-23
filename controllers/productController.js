import { Product } from "../models/Product.js";
import { ObjectId } from "mongodb";

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
    const { images, ...otherFields } = req.body;
    // images: array of URLs
    const productData = { ...otherFields, images };
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
    const { images, ...otherFields } = req.body;
    const updateData = {
      ...otherFields,
      images,
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

export const getAllSizes = async (req, res) => {
  try {
    const sizes = await Product.getAllSizes();
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
    const colors = await Product.getAllColors();
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching colors",
      error: error.message,
    });
  }
};
