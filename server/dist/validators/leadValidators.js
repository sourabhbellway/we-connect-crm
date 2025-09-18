"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadByIdValidation = exports.deleteLeadValidation = exports.updateLeadValidation = exports.createLeadValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createLeadValidation = [
    (0, express_validator_1.body)("firstName")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First name can only contain letters and spaces")
        .custom((val) => {
        console.log("VALIDATING firstName:", val);
        return true;
    }),
    (0, express_validator_1.body)("lastName")
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Last name can only contain letters and spaces"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please provide a valid email address"),
    (0, express_validator_1.body)("phone")
        .isMobilePhone("en-IN")
        .withMessage("Phone number must be a valid Indian mobile number"),
    (0, express_validator_1.body)("company")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Company name must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Company name contains invalid characters"),
    (0, express_validator_1.body)("position")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Position must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Position contains invalid characters"),
    (0, express_validator_1.body)("sourceId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Source ID must be a valid integer"),
    (0, express_validator_1.body)("status")
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
    (0, express_validator_1.body)("notes")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Notes must not exceed 1000 characters"),
    (0, express_validator_1.body)("assignedTo")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Assigned user ID must be a valid integer"),
    (0, express_validator_1.body)("tags")
        .optional()
        .custom((value) => {
        if (value === undefined || value === null)
            return true;
        if (!Array.isArray(value))
            return false;
        return value.every((tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1);
    })
        .withMessage("Tags must be an array of positive integers"),
];
exports.updateLeadValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid lead ID"),
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
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email address"),
    (0, express_validator_1.body)("phone")
        .isMobilePhone("en-IN")
        .withMessage("Phone number must be a valid Indian mobile number"),
    (0, express_validator_1.body)("company")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Company name must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Company name contains invalid characters"),
    (0, express_validator_1.body)("position")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Position must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Position contains invalid characters"),
    (0, express_validator_1.body)("sourceId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Source ID must be a valid integer"),
    (0, express_validator_1.body)("status")
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
    (0, express_validator_1.body)("notes")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Notes must not exceed 1000 characters"),
    (0, express_validator_1.body)("assignedTo")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Assigned user ID must be a valid integer"),
    (0, express_validator_1.body)("tags")
        .optional()
        .custom((value) => {
        if (value === undefined || value === null)
            return true;
        if (!Array.isArray(value))
            return false;
        return value.every((tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1);
    })
        .withMessage("Tags must be an array of positive integers"),
];
exports.deleteLeadValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];
exports.getLeadByIdValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];
//# sourceMappingURL=leadValidators.js.map