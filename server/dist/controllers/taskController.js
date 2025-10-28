"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskStats = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const getTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, priority, assignedTo, leadId, dealId, contactId, search } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;
        const whereClause = { isActive: true, deletedAt: null };
        if (status) {
            whereClause.status = status.toUpperCase();
        }
        if (priority) {
            whereClause.priority = priority.toUpperCase();
        }
        if (assignedTo) {
            whereClause.assignedTo = parseInt(assignedTo);
        }
        if (leadId) {
            whereClause.leadId = parseInt(leadId);
        }
        if (dealId) {
            whereClause.dealId = parseInt(dealId);
        }
        if (contactId) {
            whereClause.contactId = parseInt(contactId);
        }
        if (search) {
            const searchTerm = search;
            whereClause.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        const [tasks, totalCount] = await Promise.all([
            prisma_1.prisma.task.findMany({
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
                    createdByUser: {
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
                            email: true,
                        },
                    },
                    deal: {
                        select: {
                            id: true,
                            title: true,
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
                },
                orderBy: [
                    { priority: "desc" },
                    { dueDate: "asc" },
                    { createdAt: "desc" }
                ],
                take: limitNum,
                skip: offset,
            }),
            prisma_1.prisma.task.count({ where: whereClause }),
        ]);
        res.json({
            success: true,
            data: {
                tasks,
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
        console.error("Get tasks error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma_1.prisma.task.findUnique({
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
                createdByUser: {
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
                        email: true,
                    },
                },
                deal: {
                    select: {
                        id: true,
                        title: true,
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
            },
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }
        res.json({
            success: true,
            data: { task },
        });
    }
    catch (error) {
        console.error("Get task by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { title, description, priority, dueDate, assignedTo, leadId, dealId, contactId, } = req.body;
        const createdBy = req.user?.id;
        const task = await prisma_1.prisma.task.create({
            data: {
                title,
                description,
                priority: priority?.toUpperCase() || "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                createdBy,
                leadId: leadId ? parseInt(leadId) : null,
                dealId: dealId ? parseInt(dealId) : null,
                contactId: contactId ? parseInt(contactId) : null,
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
                createdByUser: {
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
        // Log activity
        await activityLogger_1.activityLoggers.taskCreated({
            id: task.id,
            title: task.title,
            assignedTo: task.assignedUser ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}` : null,
            leadId: task.leadId,
            leadName: task.lead ? `${task.lead.firstName} ${task.lead.lastName}` : null,
        }, createdBy);
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: { task },
        });
    }
    catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
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
        const { title, description, status, priority, dueDate, assignedTo, completedAt, } = req.body;
        const userId = req.user?.id;
        // Check if task exists
        const existingTask = await prisma_1.prisma.task.findUnique({
            where: { id: parseInt(id), deletedAt: null },
        });
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }
        const wasCompleted = existingTask.status === "COMPLETED";
        const isNowCompleted = status === "COMPLETED";
        const task = await prisma_1.prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                status: status?.toUpperCase(),
                priority: priority?.toUpperCase(),
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                completedAt: completedAt ? new Date(completedAt) : isNowCompleted && !wasCompleted ? new Date() : undefined,
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
                createdByUser: {
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
        if (isNowCompleted && !wasCompleted) {
            await activityLogger_1.activityLoggers.taskCompleted({
                id: task.id,
                title: task.title,
                leadId: task.leadId,
                leadName: task.lead ? `${task.lead.firstName} ${task.lead.lastName}` : null,
            }, userId);
        }
        res.json({
            success: true,
            message: "Task updated successfully",
            data: { task },
        });
    }
    catch (error) {
        console.error("Update task error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if task exists
        const existingTask = await prisma_1.prisma.task.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }
        await prisma_1.prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
        res.json({
            success: true,
            message: "Task deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteTask = deleteTask;
const getTaskStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const [totalTasks, pendingTasks, inProgressTasks, completedTasks, overdueTasks, myTasks,] = await Promise.all([
            prisma_1.prisma.task.count({ where: { isActive: true } }),
            prisma_1.prisma.task.count({ where: { status: "PENDING", isActive: true } }),
            prisma_1.prisma.task.count({ where: { status: "IN_PROGRESS", isActive: true } }),
            prisma_1.prisma.task.count({ where: { status: "COMPLETED", isActive: true } }),
            prisma_1.prisma.task.count({
                where: {
                    isActive: true,
                    dueDate: { lt: new Date() },
                    status: { not: "COMPLETED" }
                }
            }),
            prisma_1.prisma.task.count({
                where: {
                    assignedTo: userId,
                    isActive: true
                }
            }),
        ]);
        res.json({
            success: true,
            data: {
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
                myTasks,
            },
        });
    }
    catch (error) {
        console.error("Get task stats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getTaskStats = getTaskStats;
//# sourceMappingURL=taskController.js.map