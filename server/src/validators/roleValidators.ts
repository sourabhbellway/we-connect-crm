import { body, param } from 'express-validator';

export const createRoleValidation = [
  body("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Role name can only contain letters and spaces"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[A-Za-z0-9\s.,'-]*$/)
    .withMessage("Description contains invalid characters"),
  body("permissionIds")
    .isArray({ min: 1 })
    .withMessage("Provide at least one permission ID")
    .custom((arr) => arr.every((id: any) => Number.isInteger(id) && id > 0))
    .withMessage("All permission IDs must be positive integers"),
];

export const updateRoleValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid role ID'),
  body("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Role name can only contain letters and spaces"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters")
    .matches(/^[A-Za-z0-9\s.,'-]*$/)
    .withMessage("Description contains invalid characters"),
  body("permissionIds")
    .isArray({ min: 1 })
    .withMessage("Provide at least one permission ID")
    .custom((arr) => arr.every((id: any) => Number.isInteger(id) && id > 0))
    .withMessage("All permission IDs must be positive integers"),
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

export const deleteRoleValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid role ID')
];