import { body } from "express-validator";

export const createUserValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),
  body("roleIds").optional().isArray().withMessage("Role IDs must be an array"),
];

export const updateUserValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
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
  body("roleIds").optional().isArray().withMessage("Role IDs must be an array"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];
