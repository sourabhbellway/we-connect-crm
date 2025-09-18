import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserRoles,
  updateProfile
} from "../controllers/userController";
import { authenticateToken, requirePermission } from "../middleware/auth";
import {
  createUserValidation,
  updateUserValidation,
} from "../validators/userValidators";

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  requirePermission("user.read"),
  getUsers
);

// Get user statistics
router.get(
  "/users/stats",
  authenticateToken,
  requirePermission("user.read"),
  getUserStats
);

// Get user roles and permissions
router.get(
  "/users/:id/roles",
  authenticateToken,
  requirePermission("user.read"),
  getUserRoles
);

// Update user profile
router.put(
  "/users/profile",
  authenticateToken,
  updateProfile
);

router.post(
  "/users",
  authenticateToken,
  requirePermission("user.create"),
  createUserValidation,
  createUser
);
router.put(
  "/users/:id",
  authenticateToken,
  requirePermission("user.update"),
  updateUserValidation,
  updateUser
);
router.delete(
  "/users/:id",
  authenticateToken,
  requirePermission("user.delete"),
  deleteUser
);

export default router;
