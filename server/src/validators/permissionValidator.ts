import { body, param } from "express-validator";

export const createPermissionValidation = [
  body("name")
    .notEmpty()
    .withMessage("Permission name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Permission name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Permission name must not contain special characters"),
  body("key")
    .notEmpty()
    .withMessage("Permission key is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Permission key must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage("Permission key can only contain letters, numbers, underscores, hyphens, and dots"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[a-zA-Z0-9\s.,-]*$/)
    .withMessage("Description contains invalid characters"),
  body("module")
    .notEmpty()
    .withMessage("Module is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Module must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Module must not contain special characters"),
];

export const updatePermissionValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid permission ID"),
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Permission name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Permission name must not contain special characters"),
  body("key")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Permission key must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage("Permission key can only contain letters, numbers, underscores, hyphens, and dots"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[a-zA-Z0-9\s.,-]*$/)
    .withMessage("Description contains invalid characters"),
  body("module")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Module must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Module must not contain special characters"),
];

export const deletePermissionValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid permission ID"),
];
