import { Review } from "../models/Review.js";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { uploadToS3, getSignedImageUrl } from "../services/s3Service.js";

export const createReview = async (req, res) => {
  try {
    const { productId, name, rating, subtext, review } = req.body;

    // Validate required fields
    if (!productId || !name || !rating || !review) {
      return res.status(400).json({
        message: "ProductId, name, rating, and review are required fields",
      });
    }

    // Validate productId format
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID format",
      });
    }

    // Validate rating (assuming 1-5 scale)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    let imageKey = null;
    if (req.file) {
      // Generate a unique key for the image
      const timestamp = Date.now();
      imageKey = `reviews/${timestamp}-${req.file.originalname}`;
      await uploadToS3(req.file, imageKey);
    }

    const result = await Review.create({
      productId,
      image: imageKey,
      name,
      rating,
      subtext,
      review,
    });

    // If there's an image, get its signed URL
    let responseData = { ...result };
    if (imageKey) {
      const imageUrl = await getSignedImageUrl(imageKey);
      responseData.imageUrl = imageUrl;
    }

    res.status(201).json(responseData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating review", error: error.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const reviewId = new ObjectId(id);
    const db = getDB();
    const review = await db.collection("reviews").findOne({ _id: reviewId });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Get signed URL for the image if it exists
    if (review.image) {
      review.imageUrl = await getSignedImageUrl(review.image);
    }

    // Add product name from productId
    if (review.productId && ObjectId.isValid(review.productId)) {
      const product = await db
        .collection("products")
        .findOne(
          { _id: new ObjectId(review.productId) },
          { projection: { name: 1 } }
        );

      if (product?.name) {
        review.product = product.name;
      }
    }

    res.status(200).json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching review", error: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { q, product, customer, rating } = req.query;
    
    // Determine if we need to use search or findAll
    let reviews;
    if (q || product || customer || rating) {
      // Use search functionality if any search parameters are provided
      reviews = await Review.search({ q, product, customer, rating });
    } else {
      // Otherwise get all reviews
      reviews = await Review.findAll();
    }
    
    const db = getDB();

    // Enhance reviews with additional data
    const reviewsWithUrls = await Promise.all(
      reviews.map(async (review) => {
        // Add signed image URL
        if (review.image) {
          const imageUrl = await getSignedImageUrl(review.image);
          review.imageUrl = imageUrl;
        }

        // Add product name
        if (review.productId && ObjectId.isValid(review.productId)) {
          const product = await db
            .collection("products")
            .findOne(
              { _id: new ObjectId(review.productId) },
              { projection: { name: 1 } }
            );
          if (product?.name) {
            review.product = product.name;
          }
        }

        return review;
      })
    );

    res.status(200).json(reviewsWithUrls);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};


export const getReviewsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const reviews = await Review.findByProductId(productId);

    // Get signed URLs for all images
    const reviewsWithUrls = await Promise.all(
      reviews.map(async (review) => {
        if (review.image) {
          review.imageUrl = await getSignedImageUrl(review.image);
        }
        return review;
      })
    );
    console.log("✅ Review sample with imageUrl:", reviewsWithUrls[0]);
    res.status(200).json(reviewsWithUrls);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const reviewId = new ObjectId(req.params.id);
    const result = await Review.delete(reviewId);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const reviewId = new ObjectId(req.params.id);
    const { productId, name, rating, subtext, review } = req.body;

    // Validate required fields if they are being updated
    if (name === "" || rating === "" || review === "") {
      return res.status(400).json({
        message: "Name, rating, and review cannot be empty",
      });
    }

    // Validate productId format if it's being updated
    if (productId && !ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID format",
      });
    }

    // Validate rating if it's being updated
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    let imageKey = undefined;
    if (req.file) {
      // Generate a unique key for the image
      const timestamp = Date.now();
      imageKey = `reviews/${productId || req.params.id}/${timestamp}-${
        req.file.originalname
      }`;
      await uploadToS3(req.file, imageKey);
    }

    const updateData = {
      ...(productId !== undefined && { productId }),
      ...(imageKey !== undefined && { image: imageKey }),
      ...(name !== undefined && { name }),
      ...(rating !== undefined && { rating }),
      ...(subtext !== undefined && { subtext }),
      ...(review !== undefined && { review }),
    };

    const result = await Review.update(reviewId, updateData);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    let responseData = { message: "Review updated successfully" };
    if (imageKey) {
      const imageUrl = await getSignedImageUrl(imageKey);
      responseData.imageUrl = imageUrl;
    }

    res.status(200).json(responseData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating review", error: error.message });
  }
};
