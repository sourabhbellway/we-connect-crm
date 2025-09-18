import { body, param } from "express-validator";

export const createTagValidation = [
  body("name")
    .notEmpty()
    .withMessage("Tag name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Tag name must be between 2 and 50 characters")
    .matches(/^[A-Za-z0-9\s&.,'-]+$/)
    .withMessage("Tag name contains invalid characters"),
  body("color")
    .notEmpty()
    .withMessage("Tag name is required")
    .matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
    .withMessage("Color must be a valid HEX code (e.g. #ff0000)"),
];

export const updateTagValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid tag ID"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Tag name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Tag name must be between 2 and 50 characters")
    .matches(/^[A-Za-z0-9\s&.,'-]+$/)
    .withMessage("Tag name contains invalid characters"),
  body("color")
    .notEmpty()
    .withMessage("Tag name is required")
    .matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
    .withMessage("Color must be a valid HEX code (e.g. #00ff00)"),
];

export const deleteTagValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid tag ID"),
];

export const getTagByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid tag ID"),
];
