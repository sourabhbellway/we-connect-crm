import { Router } from "express";
import invoiceController from "../controllers/invoiceController";
import { authenticateToken as authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get invoice template (from quotation or fresh)
router.get("/template", invoiceController.getInvoiceTemplate.bind(invoiceController));

// Get invoice statistics
router.get("/stats", invoiceController.getInvoiceStats.bind(invoiceController));

// Get overdue invoices
router.get("/overdue", invoiceController.getOverdueInvoices.bind(invoiceController));

// Get all invoices
router.get("/", invoiceController.getAllInvoices.bind(invoiceController));

// Get invoice by ID
router.get("/:id", invoiceController.getInvoiceById.bind(invoiceController));

// Create invoice
router.post("/", invoiceController.createInvoice.bind(invoiceController));

// Update invoice
router.put("/:id", invoiceController.updateInvoice.bind(invoiceController));

// Send invoice
router.post("/:id/send", invoiceController.sendInvoice.bind(invoiceController));

// Record payment
router.post("/:id/payments", invoiceController.recordPayment.bind(invoiceController));

// Delete invoice
router.delete("/:id", invoiceController.deleteInvoice.bind(invoiceController));

export default router;
