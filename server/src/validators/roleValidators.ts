import { body, param } from 'express-validator';

export const createRoleValidation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('permissionIds')
    .optional()
    .isArray()
    .withMessage('Permission IDs must be an array')
];

export const updateRoleValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid role ID'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('permissionIds')
    .optional()
    .isArray()
    .withMessage('Permission IDs must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

export const assignRoleValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('roleIds')
    .isArray({ min: 1 })
    .withMessage('At least one role ID is required')
];