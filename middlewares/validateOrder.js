import { body, validationResult } from "express-validator";

export const validateOrder = [
  // Personal Information Validation
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
  body("notes").optional().trim(),

  // Cart Items Validation
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),
  body("items.*.size").isArray().withMessage("Size must be an array"),
  body("items.*.color").isArray().withMessage("Color must be an array"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("items.*.cumulativeSum")
    .isFloat({ min: 0 })
    .withMessage("Cumulative sum must be a positive number"),

  // Validation Result Handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
