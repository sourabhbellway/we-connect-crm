import express from "express";
import { 
  login, 
  getProfile, 
  register, 
  getRolePermissions,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  verifyEmail
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import SecurityMiddleware from "../middleware/security";
import { 
  loginValidation, 
  registerValidation, 
  forgotPasswordValidation,
  resetPasswordValidation
} from "../validators/authValidators";

const router = express.Router();

// Apply rate limiting to authentication routes
router.use(SecurityMiddleware.rateLimit(50, 15)); // 50 requests per 15 minutes
router.use(SecurityMiddleware.deviceValidation());

// Public routes (no authentication required)
router.post("/login", SecurityMiddleware.rateLimitLogin(5, 15), loginValidation, login);
router.post("/register", registerValidation, register);
router.post("/forgot-password", SecurityMiddleware.rateLimitLogin(3, 60), forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.post("/refresh-token", refreshToken);
router.get("/verify-email/:token", verifyEmail);

// Protected routes (authentication required)
router.get("/profile", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);
router.get("/roles/:roleId/permissions", authenticateToken, getRolePermissions);

export default router;
