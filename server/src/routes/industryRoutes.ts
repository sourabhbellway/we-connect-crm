import express from "express";
import {
  getIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  addIndustryField,
  updateIndustryField,
  deleteIndustryField,
} from "../controllers/industryController";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = express.Router();

// Admin-only Industry management
router.get(
  "/industries",
  authenticateToken,
  requireRole("Admin"),
  getIndustries
);
router.post(
  "/industries",
  authenticateToken,
  requireRole("Admin"),
  createIndustry
);
router.put(
  "/industries/:id",
  authenticateToken,
  requireRole("Admin"),
  updateIndustry
);
router.delete(
  "/industries/:id",
  authenticateToken,
  requireRole("Admin"),
  deleteIndustry
);

// Fields under an industry
router.post(
  "/industries/:id/fields",
  authenticateToken,
  requireRole("Admin"),
  addIndustryField
);
router.put(
  "/industries/fields/:fieldId",
  authenticateToken,
  requireRole("Admin"),
  updateIndustryField
);
router.delete(
  "/industries/fields/:fieldId",
  authenticateToken,
  requireRole("Admin"),
  deleteIndustryField
);

export default router;
