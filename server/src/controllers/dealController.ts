import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { activityLoggers } from "../utils/activityLogger";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getDeals = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      assignedTo, 
      contactId,
      leadId,
      minValue,
      maxValue 
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { isActive: true, deletedAt: null };

    if (search) {
      const searchTerm = search as string;
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (status) {
      whereClause.status = (status as string).toUpperCase();
    }

    if (assignedTo) {
      whereClause.assignedTo = parseInt(assignedTo as string);
    }

    if (contactId) {
      whereClause.contactId = parseInt(contactId as string);
    }

    if (leadId) {
      whereClause.leadId = parseInt(leadId as string);
    }

    if (minValue) {
      whereClause.value = { ...whereClause.value, gte: parseFloat(minValue as string) };
    }

    if (maxValue) {
      whereClause.value = { ...whereClause.value, lte: parseFloat(maxValue as string) };
    }

    const [deals, totalCount] = await Promise.all([
      prisma.deal.findMany({
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
      prisma.deal.count({ where: whereClause }),
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
  } catch (error) {
    console.error("Get deals error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDealById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deal = await prisma.deal.findUnique({
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
  } catch (error) {
    console.error("Get deal by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createDeal = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      value,
      currency,
      probability,
      expectedCloseDate,
      assignedTo,
      contactId,
      leadId,
      companyId,
      products,
    } = req.body;
    const createdBy = (req as AuthenticatedRequest).user?.id;

    const deal = await prisma.deal.create({
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
          create: products.map((product: any) => ({
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
    await activityLoggers.dealCreated(
      {
        id: deal.id,
        title: deal.title,
        value: deal.value,
        contactId: deal.contactId,
        contactName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : null,
      },
      createdBy
    );

    res.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: { deal },
    });
  } catch (error) {
    console.error("Create deal error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateDeal = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const {
      title,
      description,
      value,
      currency,
      status,
      probability,
      expectedCloseDate,
      actualCloseDate,
      assignedTo,
      contactId,
      companyId,
      products,
    } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;

    // Check if deal exists
    const existingDeal = await prisma.deal.findUnique({
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

    const deal = await prisma.deal.update({
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
          create: products.map((product: any) => ({
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
      await activityLoggers.dealWon(
        {
          id: deal.id,
          title: deal.title,
          value: deal.value,
          contactName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : null,
        },
        userId
      );
    } else if (isNowLost && !wasLost) {
      await activityLoggers.dealLost(
        {
          id: deal.id,
          title: deal.title,
          value: deal.value,
          contactName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : null,
        },
        userId
      );
    }

    res.json({
      success: true,
      message: "Deal updated successfully",
      data: { deal },
    });
  } catch (error) {
    console.error("Update deal error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDeal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    await prisma.deal.update({
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
  } catch (error) {
    console.error("Delete deal error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDealStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    
    const [
      totalDeals,
      activeDeals,
      wonDeals,
      lostDeals,
      totalValue,
      wonValue,
      myDeals,
      dealsThisMonth,
    ] = await Promise.all([
      prisma.deal.count({ where: { isActive: true } }),
      prisma.deal.count({ 
        where: { 
          isActive: true, 
          status: { notIn: ["WON", "LOST"] }
        } 
      }),
      prisma.deal.count({ where: { status: "WON", isActive: true } }),
      prisma.deal.count({ where: { status: "LOST", isActive: true } }),
      prisma.deal.aggregate({
        where: { isActive: true },
        _sum: { value: true },
      }),
      prisma.deal.aggregate({
        where: { isActive: true, status: "WON" },
        _sum: { value: true },
      }),
      prisma.deal.count({ 
        where: { 
          assignedTo: userId, 
          isActive: true 
        } 
      }),
      prisma.deal.count({
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
  } catch (error) {
    console.error("Get deal stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};