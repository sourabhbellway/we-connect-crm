import express from "express";
import { proposalTemplateController } from "../controllers/proposalTemplateController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all proposal templates
router.get("/proposal-templates", proposalTemplateController.getAll);

// Get single template
router.get("/proposal-templates/:id", proposalTemplateController.getById);

// Create new template
router.post("/proposal-templates", proposalTemplateController.create);

// Update template
router.put("/proposal-templates/:id", proposalTemplateController.update);

// Delete template
router.delete("/proposal-templates/:id", proposalTemplateController.delete);

// Set as default template
router.patch("/proposal-templates/:id/set-default", proposalTemplateController.setDefault);

// Duplicate template
router.post("/proposal-templates/:id/duplicate", proposalTemplateController.duplicate);

export default router;
