import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

// Get all activities with pagination
export const getActivities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
};

// Get recent activities for dashboard
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

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
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
    });
  }
};

// Create a new activity
export const createActivity = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      icon,
      iconColor,
      tags,
      metadata,
      userId,
    } = req.body;
    const errors = validationResult(req);
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
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create activity",
    });
  }
};

// Get activity statistics
export const getActivityStats = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity statistics",
    });
  }
};

export const getDeletedData = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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
  } catch (error) {
    console.error("Error fetching deleted data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deleted data",
    });
  }
};

// Cleanup old soft-deleted records (older than 30 days)
export const cleanupOldDeletedRecords = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error cleaning up old records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup old records",
    });
  }
};