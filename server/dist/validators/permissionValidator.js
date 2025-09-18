"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermissionValidation = exports.updatePermissionValidation = exports.createPermissionValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createPermissionValidation = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Permission name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Permission name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Permission name must not contain special characters"),
    (0, express_validator_1.body)("key")
        .notEmpty()
        .withMessage("Permission key is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Permission key must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage("Permission key can only contain letters, numbers, underscores, hyphens, and dots"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .matches(/^[a-zA-Z0-9\s.,-]*$/)
        .withMessage("Description contains invalid characters"),
    (0, express_validator_1.body)("module")
        .notEmpty()
        .withMessage("Module is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Module must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Module must not contain special characters"),
];
exports.updatePermissionValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid permission ID"),
    (0, express_validator_1.body)("name")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Permission name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Permission name must not contain special characters"),
    (0, express_validator_1.body)("key")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Permission key must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage("Permission key can only contain letters, numbers, underscores, hyphens, and dots"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .matches(/^[a-zA-Z0-9\s.,-]*$/)
        .withMessage("Description contains invalid characters"),
    (0, express_validator_1.body)("module")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Module must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Module must not contain special characters"),
];
exports.deletePermissionValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid permission ID"),
];
//# sourceMappingURL=permissionValidator.js.map