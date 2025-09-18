import { body, param } from "express-validator";

export const createLeadSourceValidation = [
  body("name")
    .notEmpty()
    .withMessage("Lead source name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Lead source name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Lead source name must not contain special characters"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[a-zA-Z0-9\s.,-]*$/)
    .withMessage("Description contains invalid characters"),
];

export const updateLeadSourceValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid lead source ID"),
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Lead source name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Lead source name must not contain special characters"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[a-zA-Z0-9\s.,-]*$/)
    .withMessage("Description contains invalid characters"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

export const deleteLeadSourceValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid lead source ID"),
];
