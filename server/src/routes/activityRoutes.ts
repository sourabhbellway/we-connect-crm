import express from "express";
import {
  getActivities,
  getRecentActivities,
  createActivity,
  getActivityStats,
  getDeletedData
} from "../controllers/activityController";
import { createActivityValidation } from "../validators/activityValidators";
import { authenticateToken, requirePermission } from "../middleware/auth";

const router = express.Router();

// Get all activities with pagination
router.get(
  "/activities",
  authenticateToken,
  requirePermission("activity.read"),
  getActivities
);

// Get recent activities for dashboard
router.get(
  "/activities/recent",
  authenticateToken,
  requirePermission("activity.read"),
  getRecentActivities
);

// Get activity statistics
router.get(
  "/activities/stats",
  authenticateToken,
  requirePermission("activity.read"),
  getActivityStats
);

// Create a new activity
router.post(
  "/activities",
  authenticateToken,
  requirePermission("activity.create"),
  createActivityValidation,
  createActivity
);

router.get(
  "/activities/deleted-data",
  authenticateToken,
  requirePermission("deleted.read"),
  getDeletedData
);

// Cleanup old deleted records (admin only)
router.post(
  "/activities/cleanup-deleted",
  authenticateToken,
  requireRole("Admin"),
  cleanupOldDeletedRecords
);

export default router;
