import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
