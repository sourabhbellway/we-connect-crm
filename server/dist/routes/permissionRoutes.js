"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const permissionController_1 = require("../controllers/permissionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/permissions", auth_1.authenticateToken, (0, auth_1.requirePermission)("permission.read"), permissionController_1.getPermissions);
router.post("/permissions", auth_1.authenticateToken, (0, auth_1.requirePermission)("permission.create"), permissionController_1.createPermission);
router.put("/permissions/:id", auth_1.authenticateToken, (0, auth_1.requirePermission)("permission.update"), permissionController_1.updatePermission);
router.delete("/permissions/:id", auth_1.authenticateToken, (0, auth_1.requirePermission)("permission.delete"), permissionController_1.deletePermission);
exports.default = router;
//# sourceMappingURL=permissionRoutes.js.map