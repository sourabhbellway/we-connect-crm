"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityStats = exports.createActivity = exports.getRecentActivities = exports.getActivities = void 0;
const client_1 = require("@prisma/client");
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
//# sourceMappingURL=activityController.js.map