"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const superAdminAuthController_1 = require("../controllers/superAdminAuthController");
const auth_1 = require("../middleware/auth");
const authValidators_1 = require("../validators/authValidators");
const router = express_1.default.Router();
// Super Admin authentication routes
router.post("/super-admin/login", authValidators_1.loginValidation, superAdminAuthController_1.superAdminLogin);
router.get("/super-admin/profile", auth_1.authenticateToken, superAdminAuthController_1.getSuperAdminProfile);
exports.default = router;
//# sourceMappingURL=superAdminAuthRoutes.js.map