"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadSourceValidation = exports.updateLeadSourceValidation = exports.createLeadSourceValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createLeadSourceValidation = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Lead source name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Lead source name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Lead source name must not contain special characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .matches(/^[a-zA-Z0-9\s.,-]*$/)
        .withMessage("Description contains invalid characters"),
];
exports.updateLeadSourceValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid lead source ID"),
    (0, express_validator_1.body)("name")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Lead source name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Lead source name must not contain special characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .matches(/^[a-zA-Z0-9\s.,-]*$/)
        .withMessage("Description contains invalid characters"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value"),
];
exports.deleteLeadSourceValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid lead source ID"),
];
//# sourceMappingURL=leadSourceValidators.js.map