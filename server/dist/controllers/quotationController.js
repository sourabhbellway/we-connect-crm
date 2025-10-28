"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationController = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const pdfService_1 = __importDefault(require("../services/pdfService"));
class QuotationController {
    // Generate unique quotation number
    async generateQuotationNumber() {
        const year = new Date().getFullYear();
        const count = await prisma_1.prisma.quotation.count({
            where: {
                quotationNumber: {
                    startsWith: `QT-${year}-`,
                },
            },
        });
        return `QT-${year}-${String(count + 1).padStart(4, "0")}`;
    }
    // Get quotation template data (company + customer + products)
    async getQuotationTemplate(req, res) {
        try {
            const { entityType, entityId } = req.query;
            // Fetch company settings with default currency
            const companySettings = await prisma_1.prisma.businessSettings.findFirst();
            const defaultCurrency = companySettings?.currency || "USD";
            // Fetch customer details based on entity type
            let customerData = null;
            let suggestedProducts = [];
            if (entityType && entityId) {
                if (entityType === "lead") {
                    const lead = await prisma_1.prisma.lead.findUnique({
                        where: { id: parseInt(entityId) },
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            company: true,
                            address: true,
                            city: true,
                            state: true,
                            zipCode: true,
                            country: true,
                            position: true,
                            website: true,
                            currency: true,
                        },
                    });
                    if (lead) {
                        customerData = {
                            ...lead,
                            fullName: `${lead.firstName} ${lead.lastName}`,
                            type: "lead",
                        };
                    }
                }
                else if (entityType === "deal") {
                    const deal = await prisma_1.prisma.deal.findUnique({
                        where: { id: parseInt(entityId) },
                        select: {
                            id: true,
                            title: true,
                            value: true,
                            currency: true,
                            contactId: true,
                            leadId: true,
                            contact: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    company: true,
                                    address: true,
                                    city: true,
                                    state: true,
                                    zipCode: true,
                                    country: true,
                                    position: true,
                                    website: true,
                                    alternatePhone: true,
                                },
                            },
                            lead: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    company: true,
                                    address: true,
                                    city: true,
                                    state: true,
                                    zipCode: true,
                                    country: true,
                                    position: true,
                                    website: true,
                                    currency: true,
                                },
                            },
                        },
                    });
                    if (deal) {
                        // Prioritize contact, then lead for customer info
                        const source = deal.contact || deal.lead;
                        if (source) {
                            customerData = {
                                ...source,
                                fullName: `${source.firstName} ${source.lastName}`,
                                type: deal.contact ? "contact" : "lead",
                                dealTitle: deal.title,
                                dealValue: deal.value,
                                dealCurrency: deal.currency,
                            };
                        }
                    }
                }
                else if (entityType === "contact") {
                    const contact = await prisma_1.prisma.contact.findUnique({
                        where: { id: parseInt(entityId) },
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            company: true,
                            address: true,
                            city: true,
                            state: true,
                            zipCode: true,
                            country: true,
                            position: true,
                            website: true,
                            alternatePhone: true,
                            companyRelation: {
                                select: {
                                    name: true,
                                    address: true,
                                    city: true,
                                    state: true,
                                    zipCode: true,
                                    country: true,
                                    phone: true,
                                    email: true,
                                    website: true,
                                    currency: true,
                                },
                            },
                        },
                    });
                    if (contact) {
                        customerData = {
                            ...contact,
                            fullName: `${contact.firstName} ${contact.lastName}`,
                            type: "contact",
                            // Use company details if available
                            companyDetails: contact.companyRelation,
                        };
                    }
                }
            }
            // Fetch available products
            const products = await prisma_1.prisma.product.findMany({
                where: {
                    isActive: true,
                    deletedAt: null,
                },
                orderBy: { name: "asc" },
            });
            // Get available currencies (you can expand this list)
            const availableCurrencies = [
                { code: "USD", symbol: "$", name: "US Dollar" },
                { code: "EUR", symbol: "€", name: "Euro" },
                { code: "GBP", symbol: "£", name: "British Pound" },
                { code: "INR", symbol: "₹", name: "Indian Rupee" },
                { code: "AUD", symbol: "A$", name: "Australian Dollar" },
                { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
                { code: "JPY", symbol: "¥", name: "Japanese Yen" },
                { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
            ];
            // Determine suggested currency
            const suggestedCurrency = customerData?.currency ||
                customerData?.dealCurrency ||
                customerData?.companyDetails?.currency ||
                defaultCurrency;
            res.json({
                success: true,
                data: {
                    company: companySettings,
                    customer: customerData,
                    products,
                    suggestedProducts,
                    quotationNumber: await this.generateQuotationNumber(),
                    defaultCurrency,
                    suggestedCurrency,
                    availableCurrencies,
                },
            });
        }
        catch (error) {
            console.error("Error fetching quotation template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch quotation template",
            });
        }
    }
    // Get all quotations
    async getAllQuotations(req, res) {
        try {
            const { page = 1, limit = 20, search, status, entityType, entityId, } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {
                deletedAt: null,
            };
            if (search) {
                where.OR = [
                    { quotationNumber: { contains: search, mode: "insensitive" } },
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
            const [quotations, total] = await Promise.all([
                prisma_1.prisma.quotation.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                            orderBy: { sortOrder: "asc" },
                        },
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
                prisma_1.prisma.quotation.count({ where }),
            ]);
            res.json({
                success: true,
                data: quotations,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / take),
                },
            });
        }
        catch (error) {
            console.error("Error fetching quotations:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch quotations",
            });
        }
    }
    // Get quotation by ID
    async getQuotationById(req, res) {
        try {
            const { id } = req.params;
            const quotation = await prisma_1.prisma.quotation.findFirst({
                where: {
                    id: parseInt(id),
                    deletedAt: null,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                        orderBy: { sortOrder: "asc" },
                    },
                    lead: true,
                    deal: {
                        include: {
                            contact: true,
                            lead: true,
                        },
                    },
                    contact: true,
                    createdByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    invoices: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            status: true,
                            totalAmount: true,
                            paidAmount: true,
                        },
                    },
                },
            });
            if (!quotation) {
                return res.status(404).json({
                    success: false,
                    message: "Quotation not found",
                });
            }
            // Update viewedAt if not already viewed
            if (!quotation.viewedAt && quotation.status === "SENT") {
                await prisma_1.prisma.quotation.update({
                    where: { id: quotation.id },
                    data: {
                        viewedAt: new Date(),
                        status: "VIEWED",
                    },
                });
            }
            res.json({
                success: true,
                data: quotation,
            });
        }
        catch (error) {
            console.error("Error fetching quotation:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch quotation",
            });
        }
    }
    // Create quotation
    async createQuotation(req, res) {
        try {
            const userId = req.user?.id;
            const { title, description, items, leadId, dealId, contactId, validUntil, notes, terms, currency, } = req.body;
            // Validate required fields
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
            // Generate quotation number
            const quotationNumber = await this.generateQuotationNumber();
            // Create quotation with items
            const quotation = await prisma_1.prisma.quotation.create({
                data: {
                    quotationNumber,
                    title,
                    description,
                    currency: currency || "USD",
                    subtotal,
                    taxAmount,
                    discountAmount,
                    totalAmount,
                    validUntil: validUntil ? new Date(validUntil) : null,
                    notes,
                    terms,
                    leadId: leadId || null,
                    dealId: dealId || null,
                    contactId: contactId || null,
                    createdBy: userId,
                    items: {
                        create: itemsData,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    lead: true,
                    deal: true,
                    contact: true,
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
                data: quotation,
                message: "Quotation created successfully",
            });
        }
        catch (error) {
            console.error("Error creating quotation:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create quotation",
            });
        }
    }
    // Update quotation
    async updateQuotation(req, res) {
        try {
            const { id } = req.params;
            const { title, description, items, status, validUntil, notes, terms, } = req.body;
            // Check if quotation exists
            const existingQuotation = await prisma_1.prisma.quotation.findFirst({
                where: { id: parseInt(id), deletedAt: null },
            });
            if (!existingQuotation) {
                return res.status(404).json({
                    success: false,
                    message: "Quotation not found",
                });
            }
            // Calculate new totals if items are provided
            let updateData = {
                title,
                description,
                status,
                validUntil: validUntil ? new Date(validUntil) : undefined,
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
                // Delete existing items and create new ones
                await prisma_1.prisma.quotationItem.deleteMany({
                    where: { quotationId: parseInt(id) },
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
            const quotation = await prisma_1.prisma.quotation.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                        orderBy: { sortOrder: "asc" },
                    },
                    lead: true,
                    deal: true,
                    contact: true,
                },
            });
            res.json({
                success: true,
                data: quotation,
                message: "Quotation updated successfully",
            });
        }
        catch (error) {
            console.error("Error updating quotation:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update quotation",
            });
        }
    }
    // Send quotation
    async sendQuotation(req, res) {
        try {
            const { id } = req.params;
            const quotation = await prisma_1.prisma.quotation.update({
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
            // TODO: Send email notification here
            res.json({
                success: true,
                data: quotation,
                message: "Quotation sent successfully",
            });
        }
        catch (error) {
            console.error("Error sending quotation:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send quotation",
            });
        }
    }
    // Accept quotation
    async acceptQuotation(req, res) {
        try {
            const { id } = req.params;
            const quotation = await prisma_1.prisma.quotation.update({
                where: { id: parseInt(id) },
                data: {
                    status: "ACCEPTED",
                    acceptedAt: new Date(),
                },
            });
            res.json({
                success: true,
                data: quotation,
                message: "Quotation accepted successfully",
            });
        }
        catch (error) {
            console.error("Error accepting quotation:", error);
            res.status(500).json({
                success: false,
                message: "Failed to accept quotation",
            });
        }
    }
    // Reject quotation
    async rejectQuotation(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const quotation = await prisma_1.prisma.quotation.update({
                where: { id: parseInt(id) },
                data: {
                    status: "REJECTED",
                    rejectedAt: new Date(),
                    notes: reason ? `Rejection reason: ${reason}` : undefined,
                },
            });
            res.json({
                success: true,
                data: quotation,
                message: "Quotation rejected",
            });
        }
        catch (error) {
            console.error("Error rejecting quotation:", error);
            res.status(500).json({
                success: false,
                message: "Failed to reject quotation",
            });
        }
    }
    // Delete quotation (soft delete)
    async deleteQuotation(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.quotation.update({
                where: { id: parseInt(id) },
                data: { deletedAt: new Date() },
            });
            res.json({
                success: true,
                message: "Quotation deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting quotation:", error);
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: "Quotation not found",
                });
            }
            res.status(500).json({
                success: false,
                message: "Failed to delete quotation",
            });
        }
    }
    // Get quotation statistics
    async getQuotationStats(req, res) {
        try {
            const [total, draft, sent, accepted, rejected] = await Promise.all([
                prisma_1.prisma.quotation.count({ where: { deletedAt: null } }),
                prisma_1.prisma.quotation.count({ where: { deletedAt: null, status: "DRAFT" } }),
                prisma_1.prisma.quotation.count({ where: { deletedAt: null, status: "SENT" } }),
                prisma_1.prisma.quotation.count({ where: { deletedAt: null, status: "ACCEPTED" } }),
                prisma_1.prisma.quotation.count({ where: { deletedAt: null, status: "REJECTED" } }),
            ]);
            const totalValue = await prisma_1.prisma.quotation.aggregate({
                where: { deletedAt: null },
                _sum: { totalAmount: true },
            });
            const acceptedValue = await prisma_1.prisma.quotation.aggregate({
                where: { deletedAt: null, status: "ACCEPTED" },
                _sum: { totalAmount: true },
            });
            res.json({
                success: true,
                data: {
                    total,
                    draft,
                    sent,
                    accepted,
                    rejected,
                    totalValue: totalValue._sum.totalAmount || 0,
                    acceptedValue: acceptedValue._sum.totalAmount || 0,
                },
            });
        }
        catch (error) {
            console.error("Error fetching quotation stats:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch quotation statistics",
            });
        }
    }
    // Generate and download PDF
    async downloadQuotationPDF(req, res) {
        try {
            const { id } = req.params;
            const quotation = await prisma_1.prisma.quotation.findFirst({
                where: {
                    id: parseInt(id),
                    deletedAt: null,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                        orderBy: { sortOrder: "asc" },
                    },
                    lead: true,
                    deal: {
                        include: {
                            contact: true,
                            lead: true,
                        },
                    },
                    contact: true,
                },
            });
            if (!quotation) {
                return res.status(404).json({
                    success: false,
                    message: "Quotation not found",
                });
            }
            // Fetch company settings
            const companySettings = await prisma_1.prisma.businessSettings.findFirst();
            // Determine customer data
            let customerData = {};
            if (quotation.lead) {
                customerData = {
                    fullName: `${quotation.lead.firstName} ${quotation.lead.lastName}`,
                    email: quotation.lead.email,
                    phone: quotation.lead.phone,
                    company: quotation.lead.company,
                    address: quotation.lead.address,
                    city: quotation.lead.city,
                    state: quotation.lead.state,
                    zipCode: quotation.lead.zipCode,
                    country: quotation.lead.country,
                };
            }
            else if (quotation.deal) {
                const source = quotation.deal.contact || quotation.deal.lead;
                if (source) {
                    customerData = {
                        fullName: `${source.firstName} ${source.lastName}`,
                        email: source.email,
                        phone: source.phone,
                        company: source.company,
                        address: source.address,
                        city: source.city,
                        state: source.state,
                        zipCode: source.zipCode,
                        country: source.country,
                    };
                }
            }
            else if (quotation.contact) {
                customerData = {
                    fullName: `${quotation.contact.firstName} ${quotation.contact.lastName}`,
                    email: quotation.contact.email,
                    phone: quotation.contact.phone,
                    company: quotation.contact.company,
                    address: quotation.contact.address,
                    city: quotation.contact.city,
                    state: quotation.contact.state,
                    zipCode: quotation.contact.zipCode,
                    country: quotation.contact.country,
                };
            }
            // Prepare PDF data
            const pdfData = {
                quotation: {
                    quotationNumber: quotation.quotationNumber,
                    title: quotation.title,
                    description: quotation.description || undefined,
                    createdAt: quotation.createdAt,
                    validUntil: quotation.validUntil || undefined,
                    currency: quotation.currency,
                    subtotal: Number(quotation.subtotal),
                    taxAmount: Number(quotation.taxAmount),
                    discountAmount: Number(quotation.discountAmount),
                    totalAmount: Number(quotation.totalAmount),
                    notes: quotation.notes || undefined,
                    terms: quotation.terms || undefined,
                },
                company: {
                    companyName: companySettings?.companyName || "Your Company",
                    companyEmail: companySettings?.companyEmail || undefined,
                    companyPhone: companySettings?.companyPhone || undefined,
                    companyAddress: companySettings?.companyAddress || undefined,
                    companyWebsite: companySettings?.companyWebsite || undefined,
                },
                customer: customerData,
                items: quotation.items.map((item) => ({
                    name: item.name,
                    description: item.description || undefined,
                    quantity: Number(item.quantity),
                    unit: item.unit || undefined,
                    unitPrice: Number(item.unitPrice),
                    taxRate: Number(item.taxRate),
                    discountRate: Number(item.discountRate),
                    totalAmount: Number(item.totalAmount),
                })),
            };
            // Generate PDF
            const pdfBuffer = await pdfService_1.default.generateQuotationPDF(pdfData);
            // Set response headers
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${quotation.quotationNumber}.pdf"`);
            res.setHeader("Content-Length", pdfBuffer.length);
            // Send PDF
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error("Error generating PDF:", error);
            res.status(500).json({
                success: false,
                message: "Failed to generate PDF",
            });
        }
    }
    // Preview PDF (same as download but with inline disposition)
    async previewQuotationPDF(req, res) {
        try {
            const { id } = req.params;
            const quotation = await prisma_1.prisma.quotation.findFirst({
                where: {
                    id: parseInt(id),
                    deletedAt: null,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                        orderBy: { sortOrder: "asc" },
                    },
                    lead: true,
                    deal: {
                        include: {
                            contact: true,
                            lead: true,
                        },
                    },
                    contact: true,
                },
            });
            if (!quotation) {
                return res.status(404).json({
                    success: false,
                    message: "Quotation not found",
                });
            }
            // Fetch company settings
            const companySettings = await prisma_1.prisma.businessSettings.findFirst();
            // Determine customer data
            let customerData = {};
            if (quotation.lead) {
                customerData = {
                    fullName: `${quotation.lead.firstName} ${quotation.lead.lastName}`,
                    email: quotation.lead.email,
                    phone: quotation.lead.phone,
                    company: quotation.lead.company,
                    address: quotation.lead.address,
                    city: quotation.lead.city,
                    state: quotation.lead.state,
                    zipCode: quotation.lead.zipCode,
                    country: quotation.lead.country,
                };
            }
            else if (quotation.deal) {
                const source = quotation.deal.contact || quotation.deal.lead;
                if (source) {
                    customerData = {
                        fullName: `${source.firstName} ${source.lastName}`,
                        email: source.email,
                        phone: source.phone,
                        company: source.company,
                        address: source.address,
                        city: source.city,
                        state: source.state,
                        zipCode: source.zipCode,
                        country: source.country,
                    };
                }
            }
            else if (quotation.contact) {
                customerData = {
                    fullName: `${quotation.contact.firstName} ${quotation.contact.lastName}`,
                    email: quotation.contact.email,
                    phone: quotation.contact.phone,
                    company: quotation.contact.company,
                    address: quotation.contact.address,
                    city: quotation.contact.city,
                    state: quotation.contact.state,
                    zipCode: quotation.contact.zipCode,
                    country: quotation.contact.country,
                };
            }
            // Prepare PDF data
            const pdfData = {
                quotation: {
                    quotationNumber: quotation.quotationNumber,
                    title: quotation.title,
                    description: quotation.description || undefined,
                    createdAt: quotation.createdAt,
                    validUntil: quotation.validUntil || undefined,
                    currency: quotation.currency,
                    subtotal: Number(quotation.subtotal),
                    taxAmount: Number(quotation.taxAmount),
                    discountAmount: Number(quotation.discountAmount),
                    totalAmount: Number(quotation.totalAmount),
                    notes: quotation.notes || undefined,
                    terms: quotation.terms || undefined,
                },
                company: {
                    companyName: companySettings?.companyName || "Your Company",
                    companyEmail: companySettings?.companyEmail || undefined,
                    companyPhone: companySettings?.companyPhone || undefined,
                    companyAddress: companySettings?.companyAddress || undefined,
                    companyWebsite: companySettings?.companyWebsite || undefined,
                },
                customer: customerData,
                items: quotation.items.map((item) => ({
                    name: item.name,
                    description: item.description || undefined,
                    quantity: Number(item.quantity),
                    unit: item.unit || undefined,
                    unitPrice: Number(item.unitPrice),
                    taxRate: Number(item.taxRate),
                    discountRate: Number(item.discountRate),
                    totalAmount: Number(item.totalAmount),
                })),
            };
            // Generate PDF
            const pdfBuffer = await pdfService_1.default.generateQuotationPDF(pdfData);
            // Set response headers for inline preview
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="${quotation.quotationNumber}.pdf"`);
            res.setHeader("Content-Length", pdfBuffer.length);
            // Send PDF
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error("Error generating PDF preview:", error);
            res.status(500).json({
                success: false,
                message: "Failed to generate PDF preview",
            });
        }
    }
}
exports.QuotationController = QuotationController;
exports.default = new QuotationController();
//# sourceMappingURL=quotationController.js.map