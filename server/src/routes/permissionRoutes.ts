import express from "express";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permissionController";
import { authenticateToken, requirePermission } from "../middleware/auth";
import { createPermissionValidation, deletePermissionValidation, updatePermissionValidation } from "../validators/permissionValidator";

const router = express.Router();

router.get(
  "/permissions",
  authenticateToken,
  requirePermission("permission.read"),
  getPermissions
);

router.post(
  "/permissions",
  authenticateToken,
  requirePermission("permission.create"),
  createPermissionValidation,
  createPermission
);

router.put(
  "/permissions/:id",
  authenticateToken,
  requirePermission("permission.update"),
  updatePermissionValidation,
  updatePermission
);

router.delete(
  "/permissions/:id",
  authenticateToken,
  requirePermission("permission.delete"),
  deletePermissionValidation,
  deletePermission
);

export default router;
