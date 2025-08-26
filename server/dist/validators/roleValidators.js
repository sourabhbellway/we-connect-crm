"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoleValidation = exports.updateRoleValidation = exports.createRoleValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createRoleValidation = [
    (0, express_validator_1.body)('name')
        .isLength({ min: 2, max: 50 })
        .withMessage('Role name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('permissionIds')
        .optional()
        .isArray()
        .withMessage('Permission IDs must be an array')
];
exports.updateRoleValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('Invalid role ID'),
    (0, express_validator_1.body)('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Role name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('permissionIds')
        .optional()
        .isArray()
        .withMessage('Permission IDs must be an array'),
    (0, express_validator_1.body)('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value')
];
exports.assignRoleValidation = [
    (0, express_validator_1.param)('userId')
        .isInt({ min: 1 })
        .withMessage('Invalid user ID'),
    (0, express_validator_1.body)('roleIds')
        .isArray({ min: 1 })
        .withMessage('At least one role ID is required')
];
//# sourceMappingURL=roleValidators.js.map