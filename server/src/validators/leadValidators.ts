import { body, param } from "express-validator";

export const createLeadValidation = [
  body("firstName")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("phone")
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),
  body("company")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("position")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters"),
  body("sourceId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Source ID must be a valid integer"),
  body("status")
    .optional()
    .isIn([
      "new",
      "contacted",
      "qualified",
      "proposal",
      "negotiation",
      "closed",
      "lost",
    ])
    .withMessage("Invalid status value"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
  body("assignedTo")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Assigned user ID must be a valid integer"),
  body("tags")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) return false;
      return value.every(
        (tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1
      );
    })
    .withMessage("Tags must be an array of positive integers"),
];

export const updateLeadValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("phone")
    .optional()
    .custom((value) => {
      if (value === "" || value === null || value === undefined) return true;
      return value.length >= 10 && value.length <= 20;
    })
    .withMessage("Phone number must be between 10 and 20 characters"),
  body("company")
    .optional()
    .custom((value) => {
      if (value === "" || value === null || value === undefined) return true;
      return value.length >= 2 && value.length <= 100;
    })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("position")
    .optional()
    .custom((value) => {
      if (value === "" || value === null || value === undefined) return true;
      return value.length >= 2 && value.length <= 100;
    })
    .withMessage("Position must be between 2 and 100 characters"),
  body("sourceId")
    .optional()
    .custom((value) => {
      if (value === "" || value === null || value === undefined) return true;
      return Number.isInteger(Number(value)) && Number(value) >= 1;
    })
    .withMessage("Source ID must be a valid integer"),
  body("status")
    .optional()
    .isIn([
      "new",
      "contacted",
      "qualified",
      "proposal",
      "negotiation",
      "closed",
      "lost",
    ])
    .withMessage("Invalid status value"),
  body("notes")
    .optional()
    .custom((value) => {
      if (value === "" || value === null || value === undefined) return true;
      return value.length <= 1000;
    })
    .withMessage("Notes must not exceed 1000 characters"),
  body("assignedTo")
    .optional()
    .custom((value) => {
      if (value === "" || value === null || value === undefined) return true;
      return Number.isInteger(Number(value)) && Number(value) >= 1;
    })
    .withMessage("Assigned user ID must be a valid integer"),
  body("tags")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) return false;
      return value.every(
        (tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1
      );
    })
    .withMessage("Tags must be an array of positive integers"),
];

export const deleteLeadValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];

export const getLeadByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];
