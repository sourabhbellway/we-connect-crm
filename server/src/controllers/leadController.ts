import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { activityLoggers } from "../utils/activityLogger";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getLeads = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit))); // Limit to 100 max
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { isActive: true };

    if (status) {
      whereClause.status = (status as string).toUpperCase();
    }

    if (search) {
      const searchTerm = search as string;
      whereClause.OR = [
        { firstName: { contains: searchTerm } },
        { lastName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { company: { contains: searchTerm } },
      ];
    }

    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
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
      prisma.lead.count({ where: whereClause }),
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
  } catch (error) {
    console.error("Get leads error:", error);

    // Check for specific database errors
    if (error instanceof Error) {
      if (
        error.message.includes("connection") ||
        error.message.includes("timeout")
      ) {
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

export const getLeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
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
  } catch (error) {
    console.error("Get lead by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createLead = async (req: Request, res: Response) => {
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
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      sourceId,
      status,
      notes,
      assignedTo,
      tags,
    } = req.body;
    if (email) {
      const emailExists = await prisma.lead.findFirst({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists For another lead",
        });
      }
    }
    const lead = await prisma.lead.create({
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
        tags:
          tags && tags.length > 0
            ? {
              create: tags.map((tagId: number) => ({
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
    const actorId = (req as any)?.user?.id;
    await activityLoggers.leadCreated(
      {
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
      },
      actorId
    );

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: { lead: transformedLead },
    });
  } catch (error) {
    console.error("Create lead error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateLead = async (req: Request, res: Response) => {
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
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      sourceId,
      status,
      notes,
      assignedTo,
      tags,
    } = req.body;

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }
    if (email && email.toLowerCase() !== existingLead.email.toLowerCase()) {
      const emailExists = await prisma.lead.findFirst({
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
    const lead = await prisma.lead.update({
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
          create:
            tags && tags.length > 0
              ? tags.map((tagId: number) => ({
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
    const actorId = (req as any)?.user?.id;
    await activityLoggers.leadUpdated(
      {
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
      },
      actorId
    );

    res.json({
      success: true,
      message: "Lead updated successfully",
      data: { lead: transformedLead },
    });
  } catch (error) {
    console.error("Update lead error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await prisma.lead.delete({
      where: { id: parseInt(id) },
    });

    // Log
    const actorId = (req as any)?.user?.id;
    await activityLoggers.leadDeleted(
      {
        id: existingLead.id,
        firstName: existingLead.firstName,
        lastName: existingLead.lastName,
        email: existingLead.email,
      },
      actorId
    );

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLeadStats = async (req: Request, res: Response) => {
  try {
    const totalLeads = await prisma.lead.count({ where: { isActive: true } });
    const newLeads = await prisma.lead.count({
      where: { status: "NEW", isActive: true },
    });
    const contactedLeads = await prisma.lead.count({
      where: { status: "CONTACTED", isActive: true },
    });
    const qualifiedLeads = await prisma.lead.count({
      where: { status: "QUALIFIED", isActive: true },
    });
    const proposalLeads = await prisma.lead.count({
      where: { status: "PROPOSAL", isActive: true },
    });
    const negotiationLeads = await prisma.lead.count({
      where: { status: "NEGOTIATION", isActive: true },
    });
    const closedLeads = await prisma.lead.count({
      where: { status: "CLOSED", isActive: true },
    });
    const lostLeads = await prisma.lead.count({
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
  } catch (error) {
    console.error("Get lead stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
