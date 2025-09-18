import express from "express";
import { login, getProfile, register, getRolePermissions } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { loginValidation, registerValidation } from "../validators/authValidators";

const router = express.Router();

router.post("/login", loginValidation, login);
router.get("/roles/:roleId/permissions", authenticateToken, getRolePermissions);
router.post("/register", authenticateToken,registerValidation, register);
router.get("/profile", authenticateToken, getProfile);

export default router;
