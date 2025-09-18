"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndustryValidation = exports.updateIndustryValidation = exports.createIndustryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createIndustryValidation = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Name contains invalid characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .matches(/^[A-Za-z0-9\s&.,-]*$/)
        .withMessage("Description contains invalid characters"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value"),
];
exports.updateIndustryValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid industry ID"),
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Name contains invalid characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .matches(/^[A-Za-z0-9\s&.,-]*$/)
        .withMessage("Description contains invalid characters"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value"),
];
exports.deleteIndustryValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid industry ID"),
];
//# sourceMappingURL=industryValidators.js.map