import express from "express";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permissionController";
import { authenticateToken, requirePermission } from "../middleware/auth";

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
  createPermission
);

router.put(
  "/permissions/:id",
  authenticateToken,
  requirePermission("permission.update"),
  updatePermission
);

router.delete(
  "/permissions/:id",
  authenticateToken,
  requirePermission("permission.delete"),
  deletePermission
);

export default router;
