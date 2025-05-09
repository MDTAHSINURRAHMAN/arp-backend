import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const collection = "reviews";

export const Review = {
  async create(reviewData) {
    const db = getDB();
    const result = await db.collection(collection).insertOne({
      productId: new ObjectId(reviewData.productId),
      image: reviewData.image,
      name: reviewData.name,
      rating: reviewData.rating,
      subtext: reviewData.subtext,
      review: reviewData.review,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  async findAll() {
    const db = getDB();
    return await db.collection(collection).find().toArray();
  },

  async findByProductId(productId) {
    const db = getDB();
    return await db
      .collection(collection)
      .find({ productId: new ObjectId(productId) })
      .toArray();
  },

  async delete(id) {
    const db = getDB();
    return await db.collection(collection).deleteOne({ _id: id });
  },

  async update(id, updateData) {
    const db = getDB();
    const { productId, image, name, rating, subtext, review } = updateData;
    return await db.collection(collection).updateOne(
      { _id: id },
      {
        $set: {
          ...(productId && { productId: new ObjectId(productId) }),
          image,
          name,
          rating,
          subtext,
          review,
          updatedAt: new Date(),
        },
      }
    );
  },
  async search(queryParams) {
    const db = getDB();
    const { product, customer, rating, q } = queryParams;
    
    // Build the query filter
    const filter = {};
    
    // General search query (q parameter)
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },      // Search by customer name
        { subtext: { $regex: q, $options: 'i' } },   // Search by subtext
        { review: { $regex: q, $options: 'i' } }     // Search by review content
      ];
    }
    
    // Specific filters
    if (customer) {
      filter.name = { $regex: customer, $options: 'i' };
    }
    
    if (rating) {
      filter.rating = rating; // Exact match for rating
    }
    
    // If product filter is provided, handle it
    if (product) {
      // First try to find the product by name to get its ID
      const productDoc = await db.collection('products').findOne(
        { name: { $regex: product, $options: 'i' } },
        { projection: { _id: 1 } }
      );
      
      if (productDoc) {
        // If product found by name, search by its ID
        filter.productId = productDoc._id;
      } else if (ObjectId.isValid(product)) {
        // If the product parameter is a valid ObjectId, search directly by ID
        filter.productId = new ObjectId(product);
      } else {
        // If it's not a valid ObjectId and no product was found by name,
        // return empty array since no results will match
        return [];
      }
    }
    
    // Execute the search
    return await db.collection(collection).find(filter).toArray();
  },
};
