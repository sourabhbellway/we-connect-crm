"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tagController_1 = require("../controllers/tagController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all tags
router.get('/tags', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), tagController_1.getTags);
// Create new tag
router.post('/tags', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), tagController_1.createTag);
// Update tag
router.put('/tags/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), tagController_1.updateTag);
// Delete tag
router.delete('/tags/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.delete'), tagController_1.deleteTag);
exports.default = router;
//# sourceMappingURL=tagRoutes.js.map