"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const security_1 = __importDefault(require("../middleware/security"));
const authValidators_1 = require("../validators/authValidators");
const router = express_1.default.Router();
// Apply rate limiting to authentication routes
router.use(security_1.default.rateLimit(50, 15)); // 50 requests per 15 minutes
router.use(security_1.default.deviceValidation());
// Public routes (no authentication required)
router.post("/login", security_1.default.rateLimitLogin(5, 15), authValidators_1.loginValidation, authController_1.login);
router.post("/register", authValidators_1.registerValidation, authController_1.register);
router.post("/forgot-password", security_1.default.rateLimitLogin(3, 60), authValidators_1.forgotPasswordValidation, authController_1.forgotPassword);
router.post("/reset-password", authValidators_1.resetPasswordValidation, authController_1.resetPassword);
router.post("/refresh-token", authController_1.refreshToken);
router.get("/verify-email/:token", authController_1.verifyEmail);
// Protected routes (authentication required)
router.get("/profile", auth_1.authenticateToken, authController_1.getProfile);
router.post("/logout", auth_1.authenticateToken, authController_1.logout);
router.get("/roles/:roleId/permissions", auth_1.authenticateToken, authController_1.getRolePermissions);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map