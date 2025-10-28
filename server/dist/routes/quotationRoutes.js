"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quotationController_1 = __importDefault(require("../controllers/quotationController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get quotation template (company + customer + products)
router.get("/template", quotationController_1.default.getQuotationTemplate.bind(quotationController_1.default));
// Get quotation statistics
router.get("/stats", quotationController_1.default.getQuotationStats.bind(quotationController_1.default));
// Get all quotations
router.get("/", quotationController_1.default.getAllQuotations.bind(quotationController_1.default));
// Get quotation by ID
router.get("/:id", quotationController_1.default.getQuotationById.bind(quotationController_1.default));
// Preview quotation PDF
router.get("/:id/pdf/preview", quotationController_1.default.previewQuotationPDF.bind(quotationController_1.default));
// Download quotation PDF
router.get("/:id/pdf/download", quotationController_1.default.downloadQuotationPDF.bind(quotationController_1.default));
// Create quotation
router.post("/", quotationController_1.default.createQuotation.bind(quotationController_1.default));
// Update quotation
router.put("/:id", quotationController_1.default.updateQuotation.bind(quotationController_1.default));
// Send quotation
router.post("/:id/send", quotationController_1.default.sendQuotation.bind(quotationController_1.default));
// Accept quotation
router.post("/:id/accept", quotationController_1.default.acceptQuotation.bind(quotationController_1.default));
// Reject quotation
router.post("/:id/reject", quotationController_1.default.rejectQuotation.bind(quotationController_1.default));
// Delete quotation
router.delete("/:id", quotationController_1.default.deleteQuotation.bind(quotationController_1.default));
exports.default = router;
//# sourceMappingURL=quotationRoutes.js.map