import express from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController";
import { authenticateToken, requirePermission } from "../middleware/auth";
import {
  createRoleValidation,
  updateRoleValidation,
} from "../validators/roleValidators";

const router = express.Router();

router.get(
  "/roles",
  authenticateToken,
  requirePermission("role.read"),
  getRoles
);
router.post(
  "/roles",
  authenticateToken,
  requirePermission("role.create"),
  createRoleValidation,
  createRole
);
router.put(
  "/roles/:id",
  authenticateToken,
  requirePermission("role.update"),
  updateRoleValidation,
  updateRole
);
router.delete(
  "/roles/:id",
  authenticateToken,
  requirePermission("role.delete"),
  deleteRole
);

export default router;
