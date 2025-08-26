"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadStats = exports.deleteLead = exports.updateLead = exports.createLead = exports.getLeadById = exports.getLeads = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const getLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = { isActive: true };
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            whereClause.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
            ];
        }
        const [leads, totalCount] = await Promise.all([
            prisma_1.prisma.lead.findMany({
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
                    tags: {
                        select: {
                            tag: {
                                select: {
                                    id: true,
                                    name: true,
                                    color: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: Number(limit),
                skip: offset,
            }),
            prisma_1.prisma.lead.count({ where: whereClause }),
        ]);
        // Transform tags data
        const transformedLeads = leads.map((lead) => ({
            ...lead,
            tags: lead.tags.map((lt) => lt.tag),
        }));
        res.json({
            success: true,
            data: {
                leads: transformedLeads,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                    totalItems: totalCount,
                    itemsPerPage: Number(limit),
                },
            },
        });
    }
    catch (error) {
        console.error("Get leads error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLeads = getLeads;
const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await prisma_1.prisma.lead.findUnique({
            where: { id: parseInt(id) },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
                    },
                },
            },
        });
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }
        // Transform tags data
        const transformedLead = {
            ...lead,
            tags: lead.tags.map((lt) => lt.tag),
        };
        res.json({
            success: true,
            data: { lead: transformedLead },
        });
    }
    catch (error) {
        console.error("Get lead by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLeadById = getLeadById;
const createLead = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { firstName, lastName, email, phone, company, position, sourceId, status, notes, assignedTo, tagIds, } = req.body;
        const lead = await prisma_1.prisma.lead.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                company,
                position,
                sourceId: sourceId ? parseInt(sourceId) : null,
                status,
                notes,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                tags: tagIds && tagIds.length > 0
                    ? {
                        create: tagIds.map((tagId) => ({
                            tag: {
                                connect: { id: tagId },
                            },
                        })),
                    }
                    : undefined,
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
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
                    },
                },
            },
        });
        // Transform tags data
        const transformedLead = {
            ...lead,
            tags: lead.tags.map((lt) => lt.tag),
        };
        res.status(201).json({
            success: true,
            message: "Lead created successfully",
            data: { lead: transformedLead },
        });
    }
    catch (error) {
        console.error("Create lead error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createLead = createLead;
const updateLead = async (req, res) => {
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
        const { firstName, lastName, email, phone, company, position, sourceId, status, notes, assignedTo, tagIds, } = req.body;
        // Check if lead exists
        const existingLead = await prisma_1.prisma.lead.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }
        const lead = await prisma_1.prisma.lead.update({
            where: { id: parseInt(id) },
            data: {
                firstName,
                lastName,
                email,
                phone,
                company,
                position,
                sourceId: sourceId ? parseInt(sourceId) : null,
                status,
                notes,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                tags: {
                    deleteMany: {},
                    create: tagIds && tagIds.length > 0
                        ? tagIds.map((tagId) => ({
                            tag: {
                                connect: { id: tagId },
                            },
                        }))
                        : [],
                },
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
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
                    },
                },
            },
        });
        // Transform tags data
        const transformedLead = {
            ...lead,
            tags: lead.tags.map((lt) => lt.tag),
        };
        res.json({
            success: true,
            message: "Lead updated successfully",
            data: { lead: transformedLead },
        });
    }
    catch (error) {
        console.error("Update lead error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateLead = updateLead;
const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if lead exists
        const existingLead = await prisma_1.prisma.lead.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }
        await prisma_1.prisma.lead.delete({
            where: { id: parseInt(id) },
        });
        res.json({
            success: true,
            message: "Lead deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete lead error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteLead = deleteLead;
const getLeadStats = async (req, res) => {
    try {
        const totalLeads = await prisma_1.prisma.lead.count({ where: { isActive: true } });
        const newLeads = await prisma_1.prisma.lead.count({
            where: { status: "NEW", isActive: true },
        });
        const contactedLeads = await prisma_1.prisma.lead.count({
            where: { status: "CONTACTED", isActive: true },
        });
        const qualifiedLeads = await prisma_1.prisma.lead.count({
            where: { status: "QUALIFIED", isActive: true },
        });
        const proposalLeads = await prisma_1.prisma.lead.count({
            where: { status: "PROPOSAL", isActive: true },
        });
        const negotiationLeads = await prisma_1.prisma.lead.count({
            where: { status: "NEGOTIATION", isActive: true },
        });
        const closedLeads = await prisma_1.prisma.lead.count({
            where: { status: "CLOSED", isActive: true },
        });
        const lostLeads = await prisma_1.prisma.lead.count({
            where: { status: "LOST", isActive: true },
        });
        res.json({
            success: true,
            data: {
                totalLeads,
                newLeads,
                contactedLeads,
                qualifiedLeads,
                proposalLeads,
                negotiationLeads,
                closedLeads,
                lostLeads,
            },
        });
    }
    catch (error) {
        console.error("Get lead stats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLeadStats = getLeadStats;
//# sourceMappingURL=leadController.js.map