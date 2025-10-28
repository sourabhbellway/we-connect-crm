"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_1 = __importDefault(require("../controllers/invoiceController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get invoice template (from quotation or fresh)
router.get("/template", invoiceController_1.default.getInvoiceTemplate.bind(invoiceController_1.default));
// Get invoice statistics
router.get("/stats", invoiceController_1.default.getInvoiceStats.bind(invoiceController_1.default));
// Get overdue invoices
router.get("/overdue", invoiceController_1.default.getOverdueInvoices.bind(invoiceController_1.default));
// Get all invoices
router.get("/", invoiceController_1.default.getAllInvoices.bind(invoiceController_1.default));
// Get invoice by ID
router.get("/:id", invoiceController_1.default.getInvoiceById.bind(invoiceController_1.default));
// Create invoice
router.post("/", invoiceController_1.default.createInvoice.bind(invoiceController_1.default));
// Update invoice
router.put("/:id", invoiceController_1.default.updateInvoice.bind(invoiceController_1.default));
// Send invoice
router.post("/:id/send", invoiceController_1.default.sendInvoice.bind(invoiceController_1.default));
// Record payment
router.post("/:id/payments", invoiceController_1.default.recordPayment.bind(invoiceController_1.default));
// Delete invoice
router.delete("/:id", invoiceController_1.default.deleteInvoice.bind(invoiceController_1.default));
exports.default = router;
//# sourceMappingURL=invoiceRoutes.js.map