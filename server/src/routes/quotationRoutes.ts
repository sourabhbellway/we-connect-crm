import { Router } from "express";
import quotationController from "../controllers/quotationController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get quotation template (company + customer + products)
router.get("/template", quotationController.getQuotationTemplate.bind(quotationController));

// Get quotation statistics
router.get("/stats", quotationController.getQuotationStats.bind(quotationController));

// Get all quotations
router.get("/", quotationController.getAllQuotations.bind(quotationController));

// Get quotation by ID
router.get("/:id", quotationController.getQuotationById.bind(quotationController));

// Preview quotation PDF
router.get("/:id/pdf/preview", quotationController.previewQuotationPDF.bind(quotationController));

// Download quotation PDF
router.get("/:id/pdf/download", quotationController.downloadQuotationPDF.bind(quotationController));

// Create quotation
router.post("/", quotationController.createQuotation.bind(quotationController));

// Update quotation
router.put("/:id", quotationController.updateQuotation.bind(quotationController));

// Send quotation
router.post("/:id/send", quotationController.sendQuotation.bind(quotationController));

// Accept quotation
router.post("/:id/accept", quotationController.acceptQuotation.bind(quotationController));

// Reject quotation
router.post("/:id/reject", quotationController.rejectQuotation.bind(quotationController));

// Delete quotation
router.delete("/:id", quotationController.deleteQuotation.bind(quotationController));

export default router;
