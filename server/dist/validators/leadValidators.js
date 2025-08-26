"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadByIdValidation = exports.deleteLeadValidation = exports.updateLeadValidation = exports.createLeadValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createLeadValidation = [
    (0, express_validator_1.body)('firstName')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be between 10 and 20 characters'),
    (0, express_validator_1.body)('company')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('position')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Position must be between 2 and 100 characters'),
    (0, express_validator_1.body)('sourceId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Source ID must be a valid integer'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'])
        .withMessage('Invalid status value'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    (0, express_validator_1.body)('assignedTo')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assigned user ID must be a valid integer'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array of tag IDs'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Each tag ID must be a positive integer')
];
exports.updateLeadValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('Invalid lead ID'),
    (0, express_validator_1.body)('firstName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('phone')
        .optional()
        .custom((value) => {
        if (value === '' || value === null || value === undefined)
            return true;
        return value.length >= 10 && value.length <= 20;
    })
        .withMessage('Phone number must be between 10 and 20 characters'),
    (0, express_validator_1.body)('company')
        .optional()
        .custom((value) => {
        if (value === '' || value === null || value === undefined)
            return true;
        return value.length >= 2 && value.length <= 100;
    })
        .withMessage('Company name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('position')
        .optional()
        .custom((value) => {
        if (value === '' || value === null || value === undefined)
            return true;
        return value.length >= 2 && value.length <= 100;
    })
        .withMessage('Position must be between 2 and 100 characters'),
    (0, express_validator_1.body)('sourceId')
        .optional()
        .custom((value) => {
        if (value === '' || value === null || value === undefined)
            return true;
        return Number.isInteger(Number(value)) && Number(value) >= 1;
    })
        .withMessage('Source ID must be a valid integer'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'])
        .withMessage('Invalid status value'),
    (0, express_validator_1.body)('notes')
        .optional()
        .custom((value) => {
        if (value === '' || value === null || value === undefined)
            return true;
        return value.length <= 1000;
    })
        .withMessage('Notes must not exceed 1000 characters'),
    (0, express_validator_1.body)('assignedTo')
        .optional()
        .custom((value) => {
        if (value === '' || value === null || value === undefined)
            return true;
        return Number.isInteger(Number(value)) && Number(value) >= 1;
    })
        .withMessage('Assigned user ID must be a valid integer'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array of tag IDs'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Each tag ID must be a positive integer')
];
exports.deleteLeadValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('Invalid lead ID')
];
exports.getLeadByIdValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('Invalid lead ID')
];
//# sourceMappingURL=leadValidators.js.map