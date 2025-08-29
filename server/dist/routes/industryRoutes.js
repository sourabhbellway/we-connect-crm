"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const industryController_1 = require("../controllers/industryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Admin-only Industry management
router.get("/industries", auth_1.authenticateToken, (0, auth_1.requireRole)("Admin"), industryController_1.getIndustries);
router.post("/industries", auth_1.authenticateToken, (0, auth_1.requireRole)("Admin"), industryController_1.createIndustry);
router.put("/industries/:id", auth_1.authenticateToken, (0, auth_1.requireRole)("Admin"), industryController_1.updateIndustry);
router.delete("/industries/:id", auth_1.authenticateToken, (0, auth_1.requireRole)("Admin"), industryController_1.deleteIndustry);
// Fields under an industry
router.post("/industries/:id/fields", auth_1.authenticateToken, (0, auth_1.requireRole)("Admin"), industryController_1.addIndustryField);
router.put("/industries/fields/:fieldId", auth_1.authenticateToken, (0, auth_1.requireRole)("Admin"), industryController_1.updateIndustryField);
router.delete("/industries/fields/:fieldId", auth_1.authenticateToken, (0, auth_1.requireRole)("Admin"), industryController_1.deleteIndustryField);
exports.default = router;
//# sourceMappingURL=industryRoutes.js.map