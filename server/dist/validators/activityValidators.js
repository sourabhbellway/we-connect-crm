"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivityValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createActivityValidation = [
    (0, express_validator_1.body)("title")
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters")
        .matches(/^[A-Za-z0-9\s.,!?-]+$/)
        .withMessage("Title contains invalid characters"),
    (0, express_validator_1.body)("description")
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .matches(/^[A-Za-z0-9\s.,!?-]*$/)
        .withMessage("Description contains invalid characters"),
    (0, express_validator_1.body)("type")
        .notEmpty()
        .withMessage("Type is required")
        .isIn(["info", "warning", "error", "success"]) // adjust list to your allowed values
        .withMessage("Invalid activity type"),
    (0, express_validator_1.body)("icon")
        // .optional()
        .isString()
        .withMessage("Icon must be a string"),
    (0, express_validator_1.body)("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isInt({ min: 1 })
        .withMessage("User ID must be a valid integer"),
    (0, express_validator_1.body)("entityId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Entity ID must be a valid integer"),
    (0, express_validator_1.body)("entityType")
        .optional()
        .isString()
        .withMessage("Entity type must be a string"),
];
//# sourceMappingURL=activityValidators.js.map