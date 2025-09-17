import { body } from "express-validator";

export const createActivityValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .matches(/^[A-Za-z0-9\s.,!?-]+$/)
    .withMessage("Title contains invalid characters"),

  body("description")
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[A-Za-z0-9\s.,!?-]*$/)
    .withMessage("Description contains invalid characters"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["info", "warning", "error", "success"]) // adjust list to your allowed values
    .withMessage("Invalid activity type"),

  body("icon")
    // .optional()
    .isString()
    .withMessage("Icon must be a string"),

  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isInt({ min: 1 })
    .withMessage("User ID must be a valid integer"),

  body("entityId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Entity ID must be a valid integer"),

  body("entityType")
    .optional()
    .isString()
    .withMessage("Entity type must be a string"),
];
