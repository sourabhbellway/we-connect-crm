"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const proposalTemplateController_1 = require("../controllers/proposalTemplateController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
// Get all proposal templates
router.get("/proposal-templates", proposalTemplateController_1.proposalTemplateController.getAll);
// Get single template
router.get("/proposal-templates/:id", proposalTemplateController_1.proposalTemplateController.getById);
// Create new template
router.post("/proposal-templates", proposalTemplateController_1.proposalTemplateController.create);
// Update template
router.put("/proposal-templates/:id", proposalTemplateController_1.proposalTemplateController.update);
// Delete template
router.delete("/proposal-templates/:id", proposalTemplateController_1.proposalTemplateController.delete);
// Set as default template
router.patch("/proposal-templates/:id/set-default", proposalTemplateController_1.proposalTemplateController.setDefault);
// Duplicate template
router.post("/proposal-templates/:id/duplicate", proposalTemplateController_1.proposalTemplateController.duplicate);
exports.default = router;
//# sourceMappingURL=proposalTemplateRoutes.js.map