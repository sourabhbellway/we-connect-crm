"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDealStats = exports.deleteDeal = exports.updateDeal = exports.createDeal = exports.getDealById = exports.getDeals = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const getDeals = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, assignedTo, contactId, leadId, minValue, maxValue } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;
        const whereClause = { isActive: true, deletedAt: null };
        if (search) {
            const searchTerm = search;
            whereClause.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        if (status) {
            whereClause.status = status.toUpperCase();
        }
        if (assignedTo) {
            whereClause.assignedTo = parseInt(assignedTo);
        }
        if (contactId) {
            whereClause.contactId = parseInt(contactId);
        }
        if (leadId) {
            whereClause.leadId = parseInt(leadId);
        }
        if (minValue) {
            whereClause.value = { ...whereClause.value, gte: parseFloat(minValue) };
        }
        if (maxValue) {
            whereClause.value = { ...whereClause.value, lte: parseFloat(maxValue) };
        }
        const [deals, totalCount] = await Promise.all([
            prisma_1.prisma.deal.findMany({
                where: whereClause,
                include: {
                    assignedUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
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
                    lead: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    companies: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    products: {
                        select: {
                            id: true,
                            name: true,
                            quantity: true,
                            price: true,
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                            products: true,
                        },
                    },
                },
                orderBy: [
                    { value: "desc" },
                    { createdAt: "desc" }
                ],
                take: limitNum,
                skip: offset,
            }),
            prisma_1.prisma.deal.count({ where: whereClause }),
        ]);
        res.json({
            success: true,
            data: {
                deals,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalItems: totalCount,
                    itemsPerPage: limitNum,
                },
            },
        });
    }
    catch (error) {
        console.error("Get deals error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getDeals = getDeals;
const getDealById = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await prisma_1.prisma.deal.findUnique({
            where: { id: parseInt(id), deletedAt: null },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                contact: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        company: true,
                        position: true,
                    },
                },
                lead: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        status: true,
                        createdAt: true,
                    },
                },
                companies: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                        quantity: true,
                        price: true,
                    },
                },
                tasks: {
                    where: { isActive: true, deletedAt: null },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: "Deal not found",
            });
        }
        res.json({
            success: true,
            data: { deal },
        });
    }
    catch (error) {
        console.error("Get deal by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getDealById = getDealById;
const createDeal = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { title, description, value, currency, probability, expectedCloseDate, assignedTo, contactId, leadId, companyId, products, } = req.body;
        const createdBy = req.user?.id;
        const deal = await prisma_1.prisma.deal.create({
            data: {
                title,
                description,
                value: value ? parseFloat(value) : null,
                currency: currency || "USD",
                probability: probability ? parseInt(probability) : 50,
                expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                contactId: contactId ? parseInt(contactId) : null,
                leadId: leadId ? parseInt(leadId) : null,
                companyId: companyId ? parseInt(companyId) : null,
                products: products && products.length > 0 ? {
                    create: products.map((product) => ({
                        name: product.name,
                        quantity: product.quantity || 1,
                        price: parseFloat(product.price),
                    })),
                } : undefined,
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                contact: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                lead: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                products: true,
            },
        });
        // Log activity
        await activityLogger_1.activityLoggers.dealCreated({
            id: deal.id,
            title: deal.title,
            value: deal.value,
            contactId: deal.contactId,
            contactName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : null,
        }, createdBy);
        res.status(201).json({
            success: true,
            message: "Deal created successfully",
            data: { deal },
        });
    }
    catch (error) {
        console.error("Create deal error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createDeal = createDeal;
const updateDeal = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { id } = req.params;
        const { title, description, value, currency, status, probability, expectedCloseDate, actualCloseDate, assignedTo, contactId, companyId, products, } = req.body;
        const userId = req.user?.id;
        // Check if deal exists
        const existingDeal = await prisma_1.prisma.deal.findUnique({
            where: { id: parseInt(id), deletedAt: null },
        });
        if (!existingDeal) {
            return res.status(404).json({
                success: false,
                message: "Deal not found",
            });
        }
        const wasWon = existingDeal.status === "WON";
        const wasLost = existingDeal.status === "LOST";
        const isNowWon = status === "WON";
        const isNowLost = status === "LOST";
        const deal = await prisma_1.prisma.deal.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                value: value ? parseFloat(value) : undefined,
                currency,
                status: status?.toUpperCase(),
                probability: probability ? parseInt(probability) : undefined,
                expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
                actualCloseDate: actualCloseDate ? new Date(actualCloseDate) :
                    (isNowWon || isNowLost) && !(wasWon || wasLost) ? new Date() : undefined,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                contactId: contactId ? parseInt(contactId) : undefined,
                companyId: companyId ? parseInt(companyId) : null,
                products: products ? {
                    deleteMany: {},
                    create: products.map((product) => ({
                        name: product.name,
                        quantity: product.quantity || 1,
                        price: parseFloat(product.price),
                    })),
                } : undefined,
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                contact: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                products: true,
            },
        });
        // Log status change activities
        if (isNowWon && !wasWon) {
            await activityLogger_1.activityLoggers.dealWon({
                id: deal.id,
                title: deal.title,
                value: deal.value,
                contactName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : null,
            }, userId);
        }
        else if (isNowLost && !wasLost) {
            await activityLogger_1.activityLoggers.dealLost({
                id: deal.id,
                title: deal.title,
                value: deal.value,
                contactName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : null,
            }, userId);
        }
        res.json({
            success: true,
            message: "Deal updated successfully",
            data: { deal },
        });
    }
    catch (error) {
        console.error("Update deal error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateDeal = updateDeal;
const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if deal exists
        const existingDeal = await prisma_1.prisma.deal.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingDeal) {
            return res.status(404).json({
                success: false,
                message: "Deal not found",
            });
        }
        await prisma_1.prisma.deal.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
        res.json({
            success: true,
            message: "Deal deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete deal error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteDeal = deleteDeal;
const getDealStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const [totalDeals, activeDeals, wonDeals, lostDeals, totalValue, wonValue, myDeals, dealsThisMonth,] = await Promise.all([
            prisma_1.prisma.deal.count({ where: { isActive: true } }),
            prisma_1.prisma.deal.count({
                where: {
                    isActive: true,
                    status: { notIn: ["WON", "LOST"] }
                }
            }),
            prisma_1.prisma.deal.count({ where: { status: "WON", isActive: true } }),
            prisma_1.prisma.deal.count({ where: { status: "LOST", isActive: true } }),
            prisma_1.prisma.deal.aggregate({
                where: { isActive: true },
                _sum: { value: true },
            }),
            prisma_1.prisma.deal.aggregate({
                where: { isActive: true, status: "WON" },
                _sum: { value: true },
            }),
            prisma_1.prisma.deal.count({
                where: {
                    assignedTo: userId,
                    isActive: true
                }
            }),
            prisma_1.prisma.deal.count({
                where: {
                    isActive: true,
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);
        // Calculate conversion rate
        const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
        res.json({
            success: true,
            data: {
                totalDeals,
                activeDeals,
                wonDeals,
                lostDeals,
                totalValue: totalValue._sum.value || 0,
                wonValue: wonValue._sum.value || 0,
                conversionRate: Math.round(conversionRate * 100) / 100,
                myDeals,
                dealsThisMonth,
            },
        });
    }
    catch (error) {
        console.error("Get deal stats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getDealStats = getDealStats;
//# sourceMappingURL=dealController.js.map