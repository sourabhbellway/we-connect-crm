"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLead = exports.getIntegrationLogs = exports.testIntegration = exports.syncIntegration = exports.syncAllIntegrations = exports.getImportBatchDetails = exports.getImportBatches = exports.exportLeads = exports.bulkImportLeads = exports.downloadCSVTemplate = exports.createLeadCommunication = exports.getLeadCommunications = exports.updateLeadFollowUp = exports.createLeadFollowUp = exports.getLeadFollowUps = exports.getLeadStats = exports.bulkAssignLeads = exports.transferLead = exports.deleteLead = exports.updateLead = exports.createLead = exports.getLeadById = exports.getLeads = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const BulkImportService_1 = require("../services/BulkImportService");
const IntegrationManager_1 = require("../services/integrations/IntegrationManager");
const AutomationService_1 = require("../services/AutomationService");
const getLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        // Validate pagination parameters
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit))); // Limit to 100 max
        const offset = (pageNum - 1) * limitNum;
        const whereClause = { isActive: true, deletedAt: null };
        if (status) {
            whereClause.status = status.toUpperCase();
        }
        if (search) {
            const raw = search || "";
            const searchTerm = raw.trim();
            if (searchTerm.length > 0) {
                whereClause.OR = [
                    { firstName: { contains: searchTerm, mode: "insensitive" } },
                    { lastName: { contains: searchTerm, mode: "insensitive" } },
                    { email: { contains: searchTerm, mode: "insensitive" } },
                    { company: { contains: searchTerm, mode: "insensitive" } },
                    { phone: { contains: searchTerm, mode: "insensitive" } },
                ];
            }
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
                orderBy: [{ createdAt: "desc" }],
                take: limitNum,
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
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalItems: totalCount,
                    itemsPerPage: limitNum,
                },
            },
        });
    }
    catch (error) {
        console.error("Get leads error:", error);
        // Check for specific database errors
        if (error instanceof Error) {
            if (error.message.includes("connection") ||
                error.message.includes("timeout")) {
                return res.status(503).json({
                    success: false,
                    message: "Database connection error. Please try again.",
                });
            }
        }
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
        const { firstName, lastName, email, phone, company, position, sourceId, status, notes, assignedTo, tags, } = req.body;
        if (email) {
            const emailExists = await prisma_1.prisma.lead.findFirst({
                where: { email, deletedAt: null },
            });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists For another lead",
                });
            }
        }
        const lead = await prisma_1.prisma.lead.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                company,
                position,
                sourceId: sourceId ? parseInt(sourceId) : null,
                status: status ? status.toUpperCase() : undefined,
                notes,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                tags: tags && tags.length > 0
                    ? {
                        create: tags.map((tagId) => ({
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
        // Log
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.leadCreated({
            id: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
        }, actorId);
        // Trigger automation for lead created
        try {
            await AutomationService_1.automationService.triggerLeadCreated(lead.id, actorId);
        }
        catch (automationError) {
            console.error('Error triggering lead created automation:', automationError);
            // Don't fail the request if automation fails
        }
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
        const { firstName, lastName, email, phone, company, position, sourceId, status, notes, assignedTo, tags, } = req.body;
        // Check if lead exists
        const existingLead = await prisma_1.prisma.lead.findUnique({
            where: { id: parseInt(id), deletedAt: null },
        });
        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }
        if (email && email.toLowerCase() !== existingLead.email.toLowerCase()) {
            const emailExists = await prisma_1.prisma.lead.findFirst({
                where: {
                    email: {
                        equals: email,
                        mode: "insensitive",
                    },
                    NOT: { id: existingLead.id },
                },
            });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists for another lead",
                });
            }
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
                status: status ? status.toUpperCase() : undefined,
                notes,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                tags: {
                    deleteMany: {},
                    create: tags && tags.length > 0
                        ? tags.map((tagId) => ({
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
        // Log
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.leadUpdated({
            id: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
        }, actorId);
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
        // await prisma.lead.delete({
        //   where: { id: parseInt(id) },
        // });
        await prisma_1.prisma.lead.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
        // Log
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.leadDeleted({
            id: existingLead.id,
            firstName: existingLead.firstName,
            lastName: existingLead.lastName,
            email: existingLead.email,
        }, actorId);
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
// Transfer lead to another user
const transferLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { newUserId, notes } = req.body;
        const currentUserId = req?.user?.id;
        // Check if lead exists
        const existingLead = await prisma_1.prisma.lead.findUnique({
            where: { id: parseInt(id), deletedAt: null },
            include: {
                assignedUser: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            },
        });
        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }
        // Validate new user exists if provided
        if (newUserId) {
            const newUser = await prisma_1.prisma.user.findUnique({
                where: { id: parseInt(newUserId) },
            });
            if (!newUser) {
                return res.status(400).json({
                    success: false,
                    message: "New assigned user not found",
                });
            }
        }
        const previousUserId = existingLead.assignedTo;
        // Update the lead assignment
        const updatedLead = await prisma_1.prisma.lead.update({
            where: { id: parseInt(id) },
            data: {
                assignedTo: newUserId ? parseInt(newUserId) : null,
                notes: notes ? `${existingLead.notes || ''}\n\n[Transfer Note]: ${notes}` : existingLead.notes,
                updatedAt: new Date(),
            },
            include: {
                assignedUser: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                tags: {
                    select: {
                        tag: {
                            select: { id: true, name: true, color: true }
                        },
                    },
                },
            },
        });
        // Transform tags data
        const transformedLead = {
            ...updatedLead,
            tags: updatedLead.tags.map((lt) => lt.tag),
        };
        // Log the transfer activity
        const actorId = currentUserId;
        await activityLogger_1.activityLoggers.leadUpdated({
            id: updatedLead.id,
            firstName: updatedLead.firstName,
            lastName: updatedLead.lastName,
            email: updatedLead.email,
        }, actorId);
        res.json({
            success: true,
            message: "Lead transferred successfully",
            data: { lead: transformedLead },
        });
    }
    catch (error) {
        console.error("Transfer lead error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.transferLead = transferLead;
// Bulk assign leads to a user
const bulkAssignLeads = async (req, res) => {
    try {
        const { leadIds, newUserId } = req.body;
        const currentUserId = req?.user?.id;
        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Lead IDs array is required",
            });
        }
        // Validate new user exists if provided
        if (newUserId) {
            const newUser = await prisma_1.prisma.user.findUnique({
                where: { id: parseInt(newUserId) },
            });
            if (!newUser) {
                return res.status(400).json({
                    success: false,
                    message: "Assigned user not found",
                });
            }
        }
        // Update all leads at once
        const updatedLeads = await prisma_1.prisma.lead.updateMany({
            where: {
                id: { in: leadIds.map((id) => parseInt(id)) },
                deletedAt: null,
            },
            data: {
                assignedTo: newUserId ? parseInt(newUserId) : null,
                updatedAt: new Date(),
            },
        });
        // Log the bulk assignment activity (simplified for performance)
        // In a real application, you might want to log each lead individually
        res.json({
            success: true,
            message: `${updatedLeads.count} leads assigned successfully`,
            data: { updatedCount: updatedLeads.count },
        });
    }
    catch (error) {
        console.error("Bulk assign leads error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.bulkAssignLeads = bulkAssignLeads;
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
// Lead Follow-up Management
const getLeadFollowUps = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;
        const [followUps, totalCount] = await Promise.all([
            prisma_1.prisma.leadFollowUp.findMany({
                where: { leadId: parseInt(leadId) },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: limitNum,
                skip: offset,
            }),
            prisma_1.prisma.leadFollowUp.count({ where: { leadId: parseInt(leadId) } }),
        ]);
        res.json({
            success: true,
            data: {
                followUps,
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
        console.error("Get lead follow-ups error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLeadFollowUps = getLeadFollowUps;
const createLeadFollowUp = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { leadId } = req.params;
        const { type, subject, notes, scheduledAt, reminderSet } = req.body;
        const userId = req.user?.id;
        // Check if lead exists
        const lead = await prisma_1.prisma.lead.findUnique({
            where: { id: parseInt(leadId), deletedAt: null },
        });
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }
        const followUp = await prisma_1.prisma.leadFollowUp.create({
            data: {
                leadId: parseInt(leadId),
                userId,
                type: type?.toUpperCase() || "NOTE",
                subject,
                notes,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                reminderSet: Boolean(reminderSet),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        // Log activity
        await activityLogger_1.activityLoggers.leadFollowUpCreated({
            leadId: lead.id,
            leadName: `${lead.firstName} ${lead.lastName}`,
            followUpType: followUp.type,
            subject: followUp.subject,
        }, userId);
        res.status(201).json({
            success: true,
            message: "Follow-up created successfully",
            data: { followUp },
        });
    }
    catch (error) {
        console.error("Create lead follow-up error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createLeadFollowUp = createLeadFollowUp;
const updateLeadFollowUp = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { leadId, followUpId } = req.params;
        const { subject, notes, scheduledAt, completedAt, isCompleted } = req.body;
        const userId = req.user?.id;
        const followUp = await prisma_1.prisma.leadFollowUp.update({
            where: {
                id: parseInt(followUpId),
                leadId: parseInt(leadId)
            },
            data: {
                subject,
                notes,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                completedAt: completedAt ? new Date(completedAt) : isCompleted ? new Date() : undefined,
                isCompleted: Boolean(isCompleted),
            },
            include: {
                user: {
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
            },
        });
        // Log completion activity
        if (isCompleted && !followUp.isCompleted) {
            await activityLogger_1.activityLoggers.leadFollowUpCompleted({
                leadId: followUp.lead.id,
                leadName: `${followUp.lead.firstName} ${followUp.lead.lastName}`,
                followUpType: followUp.type,
                subject: followUp.subject,
            }, userId);
        }
        res.json({
            success: true,
            message: "Follow-up updated successfully",
            data: { followUp },
        });
    }
    catch (error) {
        console.error("Update lead follow-up error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateLeadFollowUp = updateLeadFollowUp;
// Lead Communication History
const getLeadCommunications = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { page = 1, limit = 10, type } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;
        const whereClause = { leadId: parseInt(leadId) };
        if (type) {
            whereClause.type = type.toUpperCase();
        }
        const [communications, totalCount] = await Promise.all([
            prisma_1.prisma.leadCommunication.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: limitNum,
                skip: offset,
            }),
            prisma_1.prisma.leadCommunication.count({ where: whereClause }),
        ]);
        res.json({
            success: true,
            data: {
                communications,
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
        console.error("Get lead communications error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLeadCommunications = getLeadCommunications;
const createLeadCommunication = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { leadId } = req.params;
        const { type, subject, content, direction, duration, outcome, scheduledAt, completedAt } = req.body;
        const userId = req.user?.id;
        const communication = await prisma_1.prisma.leadCommunication.create({
            data: {
                leadId: parseInt(leadId),
                userId,
                type: type?.toUpperCase() || "NOTE",
                subject,
                content,
                direction: direction || "outbound",
                duration: duration ? parseInt(duration) : null,
                outcome,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                completedAt: completedAt ? new Date(completedAt) : null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        // Log activity
        await activityLogger_1.activityLoggers.communicationLogged({
            leadId: parseInt(leadId),
            communicationType: communication.type,
            direction: communication.direction,
        }, userId);
        res.status(201).json({
            success: true,
            message: "Communication logged successfully",
            data: { communication },
        });
    }
    catch (error) {
        console.error("Create lead communication error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createLeadCommunication = createLeadCommunication;
// Bulk Import/Export Functions
const downloadCSVTemplate = async (req, res) => {
    try {
        const bulkImportService = new BulkImportService_1.BulkImportService(prisma_1.prisma);
        const csvContent = await bulkImportService.generateCSVTemplate();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="leads_template.csv"');
        res.send(csvContent);
    }
    catch (error) {
        console.error('Download CSV template error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating CSV template',
        });
    }
};
exports.downloadCSVTemplate = downloadCSVTemplate;
const bulkImportLeads = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'CSV file is required',
            });
        }
        const bulkImportService = new BulkImportService_1.BulkImportService(prisma_1.prisma);
        const result = await bulkImportService.processCSVFile(req.file.path, req.file.originalname, userId);
        res.json({
            success: true,
            message: `Import completed. ${result.successRows} leads imported successfully, ${result.failedRows} failed.`,
            data: result,
        });
    }
    catch (error) {
        console.error('Bulk import leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing CSV file',
        });
    }
};
exports.bulkImportLeads = bulkImportLeads;
const exportLeads = async (req, res) => {
    try {
        const { status, assignedTo, createdAfter, createdBefore } = req.query;
        const filters = {};
        if (status)
            filters.status = status;
        if (assignedTo)
            filters.assignedTo = parseInt(assignedTo);
        if (createdAfter)
            filters.createdAfter = new Date(createdAfter);
        if (createdBefore)
            filters.createdBefore = new Date(createdBefore);
        const bulkImportService = new BulkImportService_1.BulkImportService(prisma_1.prisma);
        const csvContent = await bulkImportService.exportLeadsToCSV(filters);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `leads_export_${timestamp}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
    }
    catch (error) {
        console.error('Export leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting leads',
        });
    }
};
exports.exportLeads = exportLeads;
const getImportBatches = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const userId = req.user?.id;
        const bulkImportService = new BulkImportService_1.BulkImportService(prisma_1.prisma);
        const batches = await bulkImportService.getImportBatches(userId, parseInt(limit));
        res.json({
            success: true,
            data: { batches },
        });
    }
    catch (error) {
        console.error('Get import batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching import batches',
        });
    }
};
exports.getImportBatches = getImportBatches;
const getImportBatchDetails = async (req, res) => {
    try {
        const { batchId } = req.params;
        const bulkImportService = new BulkImportService_1.BulkImportService(prisma_1.prisma);
        const batchDetails = await bulkImportService.getImportBatchDetails(parseInt(batchId));
        if (!batchDetails) {
            return res.status(404).json({
                success: false,
                message: 'Import batch not found',
            });
        }
        res.json({
            success: true,
            data: { batch: batchDetails },
        });
    }
    catch (error) {
        console.error('Get import batch details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching import batch details',
        });
    }
};
exports.getImportBatchDetails = getImportBatchDetails;
// Integration Functions
const syncAllIntegrations = async (req, res) => {
    try {
        const integrationManager = new IntegrationManager_1.IntegrationManager(prisma_1.prisma);
        await integrationManager.initializeIntegrations();
        const result = await integrationManager.syncAllIntegrations();
        res.json({
            success: true,
            message: 'Integration sync completed',
            data: result,
        });
    }
    catch (error) {
        console.error('Sync all integrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing integrations',
        });
    }
};
exports.syncAllIntegrations = syncAllIntegrations;
const syncIntegration = async (req, res) => {
    try {
        const { integrationName } = req.params;
        const integrationManager = new IntegrationManager_1.IntegrationManager(prisma_1.prisma);
        await integrationManager.initializeIntegrations();
        const result = await integrationManager.syncIntegration(integrationName);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Integration sync failed',
            });
        }
        res.json({
            success: true,
            message: `${integrationName} integration synced successfully`,
            data: { count: result.count },
        });
    }
    catch (error) {
        console.error('Sync integration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing integration',
        });
    }
};
exports.syncIntegration = syncIntegration;
const testIntegration = async (req, res) => {
    try {
        const { integrationName } = req.params;
        const integrationManager = new IntegrationManager_1.IntegrationManager(prisma_1.prisma);
        await integrationManager.initializeIntegrations();
        const result = await integrationManager.testIntegration(integrationName);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Integration test failed',
            });
        }
        res.json({
            success: true,
            message: `${integrationName} integration test successful`,
        });
    }
    catch (error) {
        console.error('Test integration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing integration',
        });
    }
};
exports.testIntegration = testIntegration;
const getIntegrationLogs = async (req, res) => {
    try {
        const { integrationName } = req.query;
        const { limit = 50 } = req.query;
        const integrationManager = new IntegrationManager_1.IntegrationManager(prisma_1.prisma);
        const logs = await integrationManager.getIntegrationLogs(integrationName, parseInt(limit));
        res.json({
            success: true,
            data: { logs },
        });
    }
    catch (error) {
        console.error('Get integration logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching integration logs',
        });
    }
};
exports.getIntegrationLogs = getIntegrationLogs;
// Convert Lead to Contact, Company, and Deal
const convertLead = async (req, res) => {
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
        const { createContact = true, createCompany = false, createDeal = false, contactData = {}, companyData = {}, dealData = {} } = req.body;
        const userId = req.user?.id;
        // Check if lead exists and is not already converted
        const existingLead = await prisma_1.prisma.lead.findUnique({
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
            },
        });
        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }
        if (existingLead.status === "CONVERTED") {
            return res.status(400).json({
                success: false,
                message: "Lead is already converted",
            });
        }
        // Start transaction for conversion
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            let createdContact = null;
            let createdCompany = null;
            let createdDeal = null;
            // 1. Create Contact if requested
            if (createContact) {
                const contactEmail = contactData.email || existingLead.email;
                // Check if contact with email already exists
                const existingContact = await tx.contact.findFirst({
                    where: { email: contactEmail, deletedAt: null },
                });
                if (existingContact) {
                    createdContact = existingContact;
                }
                else {
                    createdContact = await tx.contact.create({
                        data: {
                            firstName: contactData.firstName || existingLead.firstName,
                            lastName: contactData.lastName || existingLead.lastName,
                            email: contactEmail,
                            phone: contactData.phone || existingLead.phone,
                            company: contactData.company || existingLead.company,
                            position: contactData.position || existingLead.position,
                            address: contactData.address || existingLead.address,
                            website: contactData.website || existingLead.website,
                            notes: contactData.notes || existingLead.notes,
                            assignedTo: existingLead.assignedTo,
                            companyId: existingLead.companyId,
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
                        },
                    });
                }
            }
            // 2. Create Company if requested
            if (createCompany && companyData.name) {
                // Check if company with name already exists
                const existingCompanyRecord = await tx.companies.findFirst({
                    where: { name: companyData.name },
                });
                if (existingCompanyRecord) {
                    createdCompany = existingCompanyRecord;
                }
                else {
                    createdCompany = await tx.companies.create({
                        data: {
                            name: companyData.name,
                            domain: companyData.domain,
                            slug: companyData.slug || companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                            industryId: companyData.industryId,
                            updatedAt: new Date(),
                        },
                    });
                }
            }
            // 3. Create Deal if requested
            if (createDeal && dealData.title) {
                createdDeal = await tx.deal.create({
                    data: {
                        title: dealData.title,
                        description: dealData.description,
                        value: dealData.value ? parseFloat(dealData.value) : null,
                        currency: dealData.currency || "USD",
                        status: dealData.status ? dealData.status.toUpperCase() : "DRAFT",
                        probability: dealData.probability || 0,
                        expectedCloseDate: dealData.expectedCloseDate ? new Date(dealData.expectedCloseDate) : null,
                        assignedTo: existingLead.assignedTo,
                        contactId: createdContact?.id,
                        leadId: existingLead.id,
                        companyId: createdCompany?.id || existingLead.companyId,
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
                        contact: true,
                        companies: true,
                    },
                });
            }
            // 4. Update Lead status to CONVERTED and link to contact
            const updatedLead = await tx.lead.update({
                where: { id: parseInt(id) },
                data: {
                    status: "CONVERTED",
                    convertedToContactId: createdContact?.id,
                    updatedAt: new Date(),
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
                    convertedToContact: true,
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
            return {
                lead: updatedLead,
                contact: createdContact,
                company: createdCompany,
                deal: createdDeal,
            };
        });
        // Transform lead tags data
        const transformedLead = {
            ...result.lead,
            tags: result.lead.tags.map((lt) => lt.tag),
        };
        // Log the conversion activity
        await activityLogger_1.activityLoggers.leadUpdated({
            id: result.lead.id,
            firstName: result.lead.firstName,
            lastName: result.lead.lastName,
            email: result.lead.email,
        }, userId);
        // Create specific activity log for lead conversion
        await prisma_1.prisma.activity.create({
            data: {
                title: "Lead Converted",
                description: `Lead ${result.lead.firstName} ${result.lead.lastName} was converted to ${result.contact ? "Contact" : ""}${result.company ? (result.contact ? ", Company" : "Company") : ""}${result.deal ? ((result.contact || result.company) ? ", and Deal" : "Deal") : ""}`,
                type: "LEAD_CONVERTED",
                icon: "FiCheckCircle",
                iconColor: "text-green-600",
                tags: ["conversion", "lead"],
                metadata: {
                    leadId: result.lead.id,
                    contactId: result.contact?.id,
                    companyId: result.company?.id,
                    dealId: result.deal?.id,
                },
                userId,
            },
        });
        res.json({
            success: true,
            message: "Lead converted successfully",
            data: {
                lead: transformedLead,
                contact: result.contact,
                company: result.company,
                deal: result.deal,
            },
        });
    }
    catch (error) {
        console.error("Convert lead error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.convertLead = convertLead;
//# sourceMappingURL=leadController.js.map