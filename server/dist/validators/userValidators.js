"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserValidation = exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createUserValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("firstName")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First name can only contain letters and spaces"),
    (0, express_validator_1.body)("lastName")
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Last name can only contain letters and spaces"),
    (0, express_validator_1.body)("roleIds").optional().isArray().withMessage("Role IDs must be an array"),
];
exports.updateUserValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("firstName")
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First name can only contain letters and spaces"),
    (0, express_validator_1.body)("lastName")
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Last name can only contain letters and spaces"),
    (0, express_validator_1.body)("roleIds").optional().isArray().withMessage("Role IDs must be an array"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value"),
];
//# sourceMappingURL=userValidators.js.map