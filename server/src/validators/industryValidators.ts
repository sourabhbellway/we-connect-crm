import { body, param } from "express-validator";

export const createIndustryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Name contains invalid characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[A-Za-z0-9\s&.,-]*$/)
    .withMessage("Description contains invalid characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

export const updateIndustryValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid industry ID"),

  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Name contains invalid characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[A-Za-z0-9\s&.,-]*$/)
    .withMessage("Description contains invalid characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

export const deleteIndustryValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid industry ID"),
];
