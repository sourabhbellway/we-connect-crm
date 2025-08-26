"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const auth_1 = require("../middleware/auth");
const roleValidators_1 = require("../validators/roleValidators");
const router = express_1.default.Router();
router.get("/roles", auth_1.authenticateToken, (0, auth_1.requirePermission)("role.read"), roleController_1.getRoles);
router.post("/roles", auth_1.authenticateToken, (0, auth_1.requirePermission)("role.create"), roleValidators_1.createRoleValidation, roleController_1.createRole);
router.put("/roles/:id", auth_1.authenticateToken, (0, auth_1.requirePermission)("role.update"), roleValidators_1.updateRoleValidation, roleController_1.updateRole);
router.delete("/roles/:id", auth_1.authenticateToken, (0, auth_1.requirePermission)("role.delete"), roleController_1.deleteRole);
exports.default = router;
//# sourceMappingURL=roleRoutes.js.map