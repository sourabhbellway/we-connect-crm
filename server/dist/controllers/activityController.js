"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldDeletedRecords = exports.getDeletedData = exports.getActivityStats = exports.createActivity = exports.getRecentActivities = exports.getActivities = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
// Get all activities with pagination
const getActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const activities = await prisma.activity.findMany({
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
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        });
        const total = await prisma.activity.count();
        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
        });
    }
};
exports.getActivities = getActivities;
// Get recent activities for dashboard
const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const activities = await prisma.activity.findMany({
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
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        });
        res.json({
            success: true,
            data: activities,
        });
    }
    catch (error) {
        console.error("Error fetching recent activities:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent activities",
        });
    }
};
exports.getRecentActivities = getRecentActivities;
// Create a new activity
const createActivity = async (req, res) => {
    try {
        const { title, description, type, icon, iconColor, tags, metadata, userId, } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const activity = await prisma.activity.create({
            data: {
                title,
                description,
                type,
                icon: icon || "FiUser",
                iconColor: iconColor || "text-blue-600",
                tags: tags || [],
                metadata: metadata || {},
                userId: userId || null,
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
        res.status(201).json({
            success: true,
            data: activity,
        });
    }
    catch (error) {
        console.error("Error creating activity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create activity",
        });
    }
};
exports.createActivity = createActivity;
// Get activity statistics
const getActivityStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
            prisma.activity.count({
                where: {
                    createdAt: {
                        gte: today,
                    },
                },
            }),
            prisma.activity.count({
                where: {
                    createdAt: {
                        gte: lastWeek,
                    },
                },
            }),
            prisma.activity.count({
                where: {
                    createdAt: {
                        gte: lastMonth,
                    },
                },
            }),
            prisma.activity.count(),
        ]);
        // Get activity by type
        const activityByType = await prisma.activity.groupBy({
            by: ["type"],
            _count: {
                type: true,
            },
            orderBy: {
                _count: {
                    type: "desc",
                },
            },
            take: 5,
        });
        res.json({
            success: true,
            data: {
                todayCount,
                weekCount,
                monthCount,
                totalCount,
                activityByType,
            },
        });
    }
    catch (error) {
        console.error("Error fetching activity stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activity statistics",
        });
    }
};
exports.getActivityStats = getActivityStats;
const getDeletedData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Calculate 30 days ago for soft delete filtering
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const deletedUsers = await prisma.user.findMany({
            where: {
                deletedAt: {
                    not: null,
                    gte: thirtyDaysAgo // Only show items deleted within last 30 days
                }
            },
            skip,
            take: limit,
            orderBy: { deletedAt: "desc" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                deletedAt: true,
            },
        });
        const deletedUsersCount = await prisma.user.count({
            where: {
                deletedAt: {
                    not: null,
                    gte: thirtyDaysAgo
                }
            },
        });
        const deletedLeads = await prisma.lead.findMany({
            where: {
                deletedAt: {
                    not: null,
                    gte: thirtyDaysAgo
                }
            },
            skip,
            take: limit,
            orderBy: { deletedAt: "desc" },
            select: {
                id: true,
                email: true,
                phone: true,
                deletedAt: true,
            },
        });
        const deletedLeadsCount = await prisma.lead.count({
            where: {
                deletedAt: {
                    not: null,
                    gte: thirtyDaysAgo
                }
            },
        });
        // Fetch deleted roles
        const deletedRoles = await prisma.role.findMany({
            where: {
                deletedAt: {
                    not: null,
                    gte: thirtyDaysAgo
                }
            },
            skip,
            take: limit,
            orderBy: { deletedAt: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                deletedAt: true,
            },
        });
        const deletedRolesCount = await prisma.role.count({
            where: {
                deletedAt: {
                    not: null,
                    gte: thirtyDaysAgo
                }
            },
        });
        // Combine response
        res.json({
            success: true,
            data: {
                users: {
                    records: deletedUsers,
                    total: deletedUsersCount,
                    pages: Math.ceil(deletedUsersCount / limit),
                },
                leads: {
                    records: deletedLeads,
                    total: deletedLeadsCount,
                    pages: Math.ceil(deletedLeadsCount / limit),
                },
                roles: {
                    records: deletedRoles,
                    total: deletedRolesCount,
                    pages: Math.ceil(deletedRolesCount / limit),
                },
            },
            pagination: {
                page,
                limit,
                retentionDays: 30,
                description: "Showing items deleted within the last 30 days",
            },
        });
    }
    catch (error) {
        console.error("Error fetching deleted data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch deleted data",
        });
    }
};
exports.getDeletedData = getDeletedData;
// Cleanup old soft-deleted records (older than 30 days)
const cleanupOldDeletedRecords = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Permanently delete records older than 30 days
        const [deletedUsers, deletedLeads, deletedRoles] = await Promise.all([
            prisma.user.deleteMany({
                where: {
                    deletedAt: {
                        not: null,
                        lt: thirtyDaysAgo,
                    },
                },
            }),
            prisma.lead.deleteMany({
                where: {
                    deletedAt: {
                        not: null,
                        lt: thirtyDaysAgo,
                    },
                },
            }),
            prisma.role.deleteMany({
                where: {
                    deletedAt: {
                        not: null,
                        lt: thirtyDaysAgo,
                    },
                },
            }),
        ]);
        res.json({
            success: true,
            message: "Old deleted records cleaned up successfully",
            data: {
                deletedUsers: deletedUsers.count,
                deletedLeads: deletedLeads.count,
                deletedRoles: deletedRoles.count,
            },
        });
    }
    catch (error) {
        console.error("Error cleaning up old records:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cleanup old records",
        });
    }
};
exports.cleanupOldDeletedRecords = cleanupOldDeletedRecords;
//# sourceMappingURL=activityController.js.map