"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
class InvoiceController {
    // Generate unique invoice number
    async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const count = await prisma_1.prisma.invoice.count({
            where: {
                invoiceNumber: {
                    startsWith: `INV-${year}-`,
                },
            },
        });
        return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
    }
    // Get invoice template data (from quotation or fresh)
    async getInvoiceTemplate(req, res) {
        try {
            const { quotationId, entityType, entityId } = req.query;
            const companySettings = await prisma_1.prisma.businessSettings.findFirst();
            let invoiceData = {
                company: companySettings,
                invoiceNumber: await this.generateInvoiceNumber(),
            };
            // If creating from quotation
            if (quotationId) {
                const quotation = await prisma_1.prisma.quotation.findFirst({
                    where: { id: parseInt(quotationId) },
                    include: {
                        items: {
                            include: { product: true },
                        },
                        lead: true,
                        deal: {
                            include: { contact: true, lead: true },
                        },
                        contact: true,
                    },
                });
                if (quotation) {
                    invoiceData = {
                        ...invoiceData,
                        quotation,
                        customer: quotation.contact || quotation.lead,
                        items: quotation.items,
                    };
                }
            }
            else if (entityType && entityId) {
                // Fetch customer data
                let customerData = null;
                if (entityType === "lead") {
                    customerData = await prisma_1.prisma.lead.findUnique({
                        where: { id: parseInt(entityId) },
                    });
                }
                else if (entityType === "deal") {
                    customerData = await prisma_1.prisma.deal.findUnique({
                        where: { id: parseInt(entityId) },
                        include: { contact: true, lead: true },
                    });
                }
                else if (entityType === "contact") {
                    customerData = await prisma_1.prisma.contact.findUnique({
                        where: { id: parseInt(entityId) },
                    });
                }
                invoiceData.customer = customerData;
            }
            // Fetch available products
            const products = await prisma_1.prisma.product.findMany({
                where: { isActive: true, deletedAt: null },
                orderBy: { name: "asc" },
            });
            invoiceData.products = products;
            res.json({
                success: true,
                data: invoiceData,
            });
        }
        catch (error) {
            console.error("Error fetching invoice template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch invoice template",
            });
        }
    }
    // Get all invoices
    async getAllInvoices(req, res) {
        try {
            const { page = 1, limit = 20, search, status, entityType, entityId, } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {
                deletedAt: null,
            };
            if (search) {
                where.OR = [
                    { invoiceNumber: { contains: search, mode: "insensitive" } },
                    { title: { contains: search, mode: "insensitive" } },
                ];
            }
            if (status) {
                where.status = status;
            }
            if (entityType && entityId) {
                if (entityType === "lead") {
                    where.leadId = parseInt(entityId);
                }
                else if (entityType === "deal") {
                    where.dealId = parseInt(entityId);
                }
                else if (entityType === "contact") {
                    where.contactId = parseInt(entityId);
                }
            }
            const [invoices, total] = await Promise.all([
                prisma_1.prisma.invoice.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        items: {
                            include: { product: true },
                            orderBy: { sortOrder: "asc" },
                        },
                        payments: true,
                        lead: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                company: true,
                            },
                        },
                        deal: {
                            select: {
                                id: true,
                                title: true,
                                contact: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        contact: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                company: true,
                            },
                        },
                        quotation: {
                            select: {
                                id: true,
                                quotationNumber: true,
                            },
                        },
                        createdByUser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.invoice.count({ where }),
            ]);
            res.json({
                success: true,
                data: invoices,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / take),
                },
            });
        }
        catch (error) {
            console.error("Error fetching invoices:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch invoices",
            });
        }
    }
    // Get invoice by ID
    async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma_1.prisma.invoice.findFirst({
                where: {
                    id: parseInt(id),
                    deletedAt: null,
                },
                include: {
                    items: {
                        include: { product: true },
                        orderBy: { sortOrder: "asc" },
                    },
                    payments: {
                        include: {
                            createdByUser: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                    lead: true,
                    deal: {
                        include: { contact: true, lead: true },
                    },
                    contact: true,
                    quotation: true,
                    createdByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found",
                });
            }
            // Update viewedAt if not already viewed
            if (!invoice.viewedAt && invoice.status === "SENT") {
                await prisma_1.prisma.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        viewedAt: new Date(),
                        status: "VIEWED",
                    },
                });
            }
            res.json({
                success: true,
                data: invoice,
            });
        }
        catch (error) {
            console.error("Error fetching invoice:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch invoice",
            });
        }
    }
    // Create invoice
    async createInvoice(req, res) {
        try {
            const userId = req.user?.id;
            const { title, description, items, leadId, dealId, contactId, quotationId, dueDate, notes, terms, currency, } = req.body;
            if (!title || !items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Title and items are required",
                });
            }
            // Calculate totals
            let subtotal = new client_1.Prisma.Decimal(0);
            let taxAmount = new client_1.Prisma.Decimal(0);
            let discountAmount = new client_1.Prisma.Decimal(0);
            const itemsData = items.map((item, index) => {
                const quantity = new client_1.Prisma.Decimal(item.quantity);
                const unitPrice = new client_1.Prisma.Decimal(item.unitPrice);
                const taxRate = new client_1.Prisma.Decimal(item.taxRate || 0);
                const discountRate = new client_1.Prisma.Decimal(item.discountRate || 0);
                const itemSubtotal = quantity.mul(unitPrice);
                const itemDiscount = itemSubtotal.mul(discountRate).div(100);
                const itemTaxableAmount = itemSubtotal.sub(itemDiscount);
                const itemTax = itemTaxableAmount.mul(taxRate).div(100);
                const itemTotal = itemTaxableAmount.add(itemTax);
                subtotal = subtotal.add(itemSubtotal);
                discountAmount = discountAmount.add(itemDiscount);
                taxAmount = taxAmount.add(itemTax);
                return {
                    productId: item.productId || null,
                    name: item.name,
                    description: item.description,
                    quantity,
                    unit: item.unit || "pcs",
                    unitPrice,
                    taxRate,
                    discountRate,
                    subtotal: itemSubtotal,
                    totalAmount: itemTotal,
                    sortOrder: index,
                };
            });
            const totalAmount = subtotal.sub(discountAmount).add(taxAmount);
            const invoiceNumber = await this.generateInvoiceNumber();
            const invoice = await prisma_1.prisma.invoice.create({
                data: {
                    invoiceNumber,
                    title,
                    description,
                    currency: currency || "USD",
                    subtotal,
                    taxAmount,
                    discountAmount,
                    totalAmount,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    notes,
                    terms,
                    leadId: leadId || null,
                    dealId: dealId || null,
                    contactId: contactId || null,
                    quotationId: quotationId || null,
                    createdBy: userId,
                    items: {
                        create: itemsData,
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                    lead: true,
                    deal: true,
                    contact: true,
                    quotation: true,
                    createdByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            res.status(201).json({
                success: true,
                data: invoice,
                message: "Invoice created successfully",
            });
        }
        catch (error) {
            console.error("Error creating invoice:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create invoice",
            });
        }
    }
    // Update invoice
    async updateInvoice(req, res) {
        try {
            const { id } = req.params;
            const { title, description, items, status, dueDate, notes, terms, } = req.body;
            const existingInvoice = await prisma_1.prisma.invoice.findFirst({
                where: { id: parseInt(id), deletedAt: null },
            });
            if (!existingInvoice) {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found",
                });
            }
            let updateData = {
                title,
                description,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                notes,
                terms,
            };
            if (items && items.length > 0) {
                let subtotal = new client_1.Prisma.Decimal(0);
                let taxAmount = new client_1.Prisma.Decimal(0);
                let discountAmount = new client_1.Prisma.Decimal(0);
                const itemsData = items.map((item, index) => {
                    const quantity = new client_1.Prisma.Decimal(item.quantity);
                    const unitPrice = new client_1.Prisma.Decimal(item.unitPrice);
                    const taxRate = new client_1.Prisma.Decimal(item.taxRate || 0);
                    const discountRate = new client_1.Prisma.Decimal(item.discountRate || 0);
                    const itemSubtotal = quantity.mul(unitPrice);
                    const itemDiscount = itemSubtotal.mul(discountRate).div(100);
                    const itemTaxableAmount = itemSubtotal.sub(itemDiscount);
                    const itemTax = itemTaxableAmount.mul(taxRate).div(100);
                    const itemTotal = itemTaxableAmount.add(itemTax);
                    subtotal = subtotal.add(itemSubtotal);
                    discountAmount = discountAmount.add(itemDiscount);
                    taxAmount = taxAmount.add(itemTax);
                    return {
                        productId: item.productId || null,
                        name: item.name,
                        description: item.description,
                        quantity,
                        unit: item.unit || "pcs",
                        unitPrice,
                        taxRate,
                        discountRate,
                        subtotal: itemSubtotal,
                        totalAmount: itemTotal,
                        sortOrder: index,
                    };
                });
                const totalAmount = subtotal.sub(discountAmount).add(taxAmount);
                await prisma_1.prisma.invoiceItem.deleteMany({
                    where: { invoiceId: parseInt(id) },
                });
                updateData = {
                    ...updateData,
                    subtotal,
                    taxAmount,
                    discountAmount,
                    totalAmount,
                    items: {
                        create: itemsData,
                    },
                };
            }
            const invoice = await prisma_1.prisma.invoice.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    items: {
                        include: { product: true },
                        orderBy: { sortOrder: "asc" },
                    },
                    payments: true,
                    lead: true,
                    deal: true,
                    contact: true,
                },
            });
            res.json({
                success: true,
                data: invoice,
                message: "Invoice updated successfully",
            });
        }
        catch (error) {
            console.error("Error updating invoice:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update invoice",
            });
        }
    }
    // Send invoice
    async sendInvoice(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma_1.prisma.invoice.update({
                where: { id: parseInt(id) },
                data: {
                    status: "SENT",
                    sentAt: new Date(),
                },
                include: {
                    items: true,
                    lead: true,
                    deal: true,
                    contact: true,
                },
            });
            // TODO: Send email notification
            res.json({
                success: true,
                data: invoice,
                message: "Invoice sent successfully",
            });
        }
        catch (error) {
            console.error("Error sending invoice:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send invoice",
            });
        }
    }
    // Record payment
    async recordPayment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const { amount, currency, paymentMethod, paymentDate, referenceNumber, notes, } = req.body;
            if (!amount || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: "Amount and payment method are required",
                });
            }
            const invoice = await prisma_1.prisma.invoice.findFirst({
                where: { id: parseInt(id), deletedAt: null },
                include: { payments: true },
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found",
                });
            }
            // Create payment record
            const payment = await prisma_1.prisma.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: new client_1.Prisma.Decimal(amount),
                    currency: currency || invoice.currency,
                    paymentMethod,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    referenceNumber,
                    notes,
                    createdBy: userId,
                },
            });
            // Calculate new paid amount
            const totalPaid = invoice.payments.reduce((sum, p) => sum.add(p.amount), new client_1.Prisma.Decimal(0)).add(new client_1.Prisma.Decimal(amount));
            // Update invoice status
            let newStatus = invoice.status;
            if (totalPaid.gte(invoice.totalAmount)) {
                newStatus = "PAID";
            }
            else if (totalPaid.gt(0)) {
                newStatus = "PARTIALLY_PAID";
            }
            const updatedInvoice = await prisma_1.prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    paidAmount: totalPaid,
                    status: newStatus,
                    paidAt: newStatus === "PAID" ? new Date() : invoice.paidAt,
                },
                include: {
                    items: true,
                    payments: {
                        include: {
                            createdByUser: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            });
            res.json({
                success: true,
                data: {
                    invoice: updatedInvoice,
                    payment,
                },
                message: "Payment recorded successfully",
            });
        }
        catch (error) {
            console.error("Error recording payment:", error);
            res.status(500).json({
                success: false,
                message: "Failed to record payment",
            });
        }
    }
    // Delete invoice (soft delete)
    async deleteInvoice(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.invoice.update({
                where: { id: parseInt(id) },
                data: { deletedAt: new Date() },
            });
            res.json({
                success: true,
                message: "Invoice deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting invoice:", error);
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found",
                });
            }
            res.status(500).json({
                success: false,
                message: "Failed to delete invoice",
            });
        }
    }
    // Get invoice statistics
    async getInvoiceStats(req, res) {
        try {
            const [total, draft, sent, paid, overdue] = await Promise.all([
                prisma_1.prisma.invoice.count({ where: { deletedAt: null } }),
                prisma_1.prisma.invoice.count({ where: { deletedAt: null, status: "DRAFT" } }),
                prisma_1.prisma.invoice.count({ where: { deletedAt: null, status: "SENT" } }),
                prisma_1.prisma.invoice.count({ where: { deletedAt: null, status: "PAID" } }),
                prisma_1.prisma.invoice.count({ where: { deletedAt: null, status: "OVERDUE" } }),
            ]);
            const totalValue = await prisma_1.prisma.invoice.aggregate({
                where: { deletedAt: null },
                _sum: { totalAmount: true, paidAmount: true },
            });
            const paidValue = await prisma_1.prisma.invoice.aggregate({
                where: { deletedAt: null, status: "PAID" },
                _sum: { totalAmount: true },
            });
            res.json({
                success: true,
                data: {
                    total,
                    draft,
                    sent,
                    paid,
                    overdue,
                    totalValue: totalValue._sum.totalAmount || 0,
                    paidValue: paidValue._sum.totalAmount || 0,
                    totalPaid: totalValue._sum.paidAmount || 0,
                    outstanding: (totalValue._sum.totalAmount || new client_1.Prisma.Decimal(0))
                        .sub(totalValue._sum.paidAmount || new client_1.Prisma.Decimal(0)),
                },
            });
        }
        catch (error) {
            console.error("Error fetching invoice stats:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch invoice statistics",
            });
        }
    }
    // Get overdue invoices
    async getOverdueInvoices(req, res) {
        try {
            const today = new Date();
            const overdueInvoices = await prisma_1.prisma.invoice.findMany({
                where: {
                    deletedAt: null,
                    status: {
                        in: ["SENT", "VIEWED", "PARTIALLY_PAID"],
                    },
                    dueDate: {
                        lt: today,
                    },
                },
                include: {
                    lead: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            company: true,
                        },
                    },
                    deal: {
                        select: {
                            title: true,
                            contact: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    contact: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            company: true,
                        },
                    },
                },
                orderBy: { dueDate: "asc" },
            });
            // Update status to OVERDUE
            await prisma_1.prisma.invoice.updateMany({
                where: {
                    id: {
                        in: overdueInvoices.map(inv => inv.id),
                    },
                },
                data: {
                    status: "OVERDUE",
                },
            });
            res.json({
                success: true,
                data: overdueInvoices,
            });
        }
        catch (error) {
            console.error("Error fetching overdue invoices:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch overdue invoices",
            });
        }
    }
}
exports.InvoiceController = InvoiceController;
exports.default = new InvoiceController();
//# sourceMappingURL=invoiceController.js.map