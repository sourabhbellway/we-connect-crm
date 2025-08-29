"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const userValidators_1 = require("../validators/userValidators");
const router = express_1.default.Router();
router.get("/users", auth_1.authenticateToken, (0, auth_1.requirePermission)("user.read"), userController_1.getUsers);
// Get user statistics
router.get("/users/stats", auth_1.authenticateToken, (0, auth_1.requirePermission)("user.read"), userController_1.getUserStats);
router.post("/users", auth_1.authenticateToken, (0, auth_1.requirePermission)("user.create"), userValidators_1.createUserValidation, userController_1.createUser);
router.put("/users/:id", auth_1.authenticateToken, (0, auth_1.requirePermission)("user.update"), userValidators_1.updateUserValidation, userController_1.updateUser);
router.delete("/users/:id", auth_1.authenticateToken, (0, auth_1.requirePermission)("user.delete"), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map