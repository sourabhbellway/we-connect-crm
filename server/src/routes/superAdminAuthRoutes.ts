import express from "express";
import {
  superAdminLogin,
  getSuperAdminProfile,
} from "../controllers/superAdminAuthController";
import { authenticateToken } from "../middleware/auth";
import { loginValidation } from "../validators/authValidators";

const router = express.Router();

// Super Admin authentication routes
router.post("/super-admin/login", loginValidation, superAdminLogin);
router.get("/super-admin/profile", authenticateToken, getSuperAdminProfile);

export default router;
