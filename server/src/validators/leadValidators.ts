import { body, param } from "express-validator";
export const createLeadValidation = [
  body("firstName")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name can only contain letters and spaces")
    .custom((val) => {
      console.log("VALIDATING firstName:", val); 
      return true;
    }),

  body("lastName")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .isMobilePhone("en-IN")
    .withMessage("Phone number must be a valid Indian mobile number"),

  body("company")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Company name contains invalid characters"),

  body("position")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Position contains invalid characters"),

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
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid lead ID"),

  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .isMobilePhone("en-IN")
    .withMessage("Phone number must be a valid Indian mobile number"),

  body("company")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Company name contains invalid characters"),

  body("position")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Position contains invalid characters"),

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

export const deleteLeadValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];

export const getLeadByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];
