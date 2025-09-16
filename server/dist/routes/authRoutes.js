"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const authValidators_1 = require("../validators/authValidators");
const router = express_1.default.Router();
router.post("/login", authValidators_1.loginValidation, authController_1.login);
router.get("/roles/:roleId/permissions", auth_1.authenticateToken, authController_1.getRolePermissions);
router.post("/register", authController_1.register);
router.get("/profile", auth_1.authenticateToken, authController_1.getProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map