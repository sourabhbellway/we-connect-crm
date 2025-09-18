"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTagByIdValidation = exports.deleteTagValidation = exports.updateTagValidation = exports.createTagValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createTagValidation = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Tag name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Tag name must be between 2 and 50 characters")
        .matches(/^[A-Za-z0-9\s&.,'-]+$/)
        .withMessage("Tag name contains invalid characters"),
    (0, express_validator_1.body)("color")
        .notEmpty()
        .withMessage("Tag name is required")
        .matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
        .withMessage("Color must be a valid HEX code (e.g. #ff0000)"),
];
exports.updateTagValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid tag ID"),
    (0, express_validator_1.body)("name")
        .optional()
        .notEmpty()
        .withMessage("Tag name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Tag name must be between 2 and 50 characters")
        .matches(/^[A-Za-z0-9\s&.,'-]+$/)
        .withMessage("Tag name contains invalid characters"),
    (0, express_validator_1.body)("color")
        .notEmpty()
        .withMessage("Tag name is required")
        .matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
        .withMessage("Color must be a valid HEX code (e.g. #00ff00)"),
];
exports.deleteTagValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid tag ID"),
];
exports.getTagByIdValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid tag ID"),
];
//# sourceMappingURL=tagValidators.js.map