import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { activityLoggers } from "../utils/activityLogger";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getContacts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, assignedTo, companyId } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { isActive: true, deletedAt: null };

    if (search) {
      const searchTerm = search as string;
      whereClause.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { company: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (assignedTo) {
      whereClause.assignedTo = parseInt(assignedTo as string);
    }

    if (companyId) {
      whereClause.companyId = parseInt(companyId as string);
    }

    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
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
          companyRelation: {
            select: {
              id: true,
              name: true,
            },
          },
          deals: {
            select: {
              id: true,
              title: true,
              value: true,
              status: true,
            },
          },
          _count: {
            select: {
              deals: true,
              tasks: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limitNum,
        skip: offset,
      }),
      prisma.contact.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalItems: totalCount,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
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
        companyRelation: {
          select: {
            id: true,
            name: true,
          },
        },
        sourceLead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
        deals: {
          select: {
            id: true,
            title: true,
            value: true,
            status: true,
            probability: true,
            expectedCloseDate: true,
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

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: { contact },
    });
  } catch (error) {
    console.error("Get contact by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createContact = async (req: Request, res: Response) => {
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
      address,
      website,
      notes,
      assignedTo,
      companyId,
    } = req.body;
    const createdBy = (req as AuthenticatedRequest).user?.id;

    // Check if email already exists
    if (email) {
      const emailExists = await prisma.contact.findFirst({
        where: { 
          email: { equals: email, mode: 'insensitive' }, 
          deletedAt: null 
        },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists for another contact",
        });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        position,
        address,
        website,
        notes,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        companyId: companyId ? parseInt(companyId) : null,
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
        companyRelation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await activityLoggers.contactCreated(
      {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
      },
      createdBy
    );

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: { contact },
    });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateContact = async (req: Request, res: Response) => {
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
      address,
      website,
      notes,
      assignedTo,
      companyId,
    } = req.body;

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: parseInt(id), deletedAt: null },
    });

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Check email uniqueness if changed
    if (email && email.toLowerCase() !== existingContact.email.toLowerCase()) {
      const emailExists = await prisma.contact.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          NOT: { id: existingContact.id },
          deletedAt: null,
        },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists for another contact",
        });
      }
    }

    const contact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        position,
        address,
        website,
        notes,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        companyId: companyId ? parseInt(companyId) : null,
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
        companyRelation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: { contact },
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    await prisma.contact.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const convertLeadToContact = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { createDeal, dealTitle, dealValue, dealProbability } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(leadId), deletedAt: null },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create contact from lead
      const contact = await tx.contact.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          position: lead.position,
          notes: lead.notes,
          assignedTo: lead.assignedTo,
          companyId: lead.companyId,
        },
      });

      // Update lead with converted contact reference
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          convertedToContactId: contact.id,
          status: "CLOSED",
        },
      });

      // Create deal if requested
      let deal = null;
      if (createDeal) {
        deal = await tx.deal.create({
          data: {
            title: dealTitle || `${lead.firstName} ${lead.lastName} - Deal`,
            value: dealValue ? parseFloat(dealValue) : null,
            probability: dealProbability ? parseInt(dealProbability) : 50,
            assignedTo: lead.assignedTo,
            contactId: contact.id,
            leadId: lead.id,
            companyId: lead.companyId,
          },
        });
      }

      return { contact, deal };
    });

    // Log activities
    await activityLoggers.leadConverted(
      {
        leadId: lead.id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        contactId: result.contact.id,
        dealId: result.deal?.id,
      },
      userId
    );

    res.json({
      success: true,
      message: "Lead converted to contact successfully",
      data: result,
    });
  } catch (error) {
    console.error("Convert lead to contact error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getContactStats = async (req: Request, res: Response) => {
  try {
    const [
      totalContacts,
      contactsWithDeals,
      activeDealsValue,
      contactsThisMonth,
    ] = await Promise.all([
      prisma.contact.count({ where: { isActive: true } }),
      prisma.contact.count({ 
        where: { 
          isActive: true,
          deals: {
            some: {
              isActive: true,
              status: { not: "WON" }
            }
          }
        } 
      }),
      prisma.deal.aggregate({
        where: { 
          isActive: true, 
          status: { notIn: ["WON", "LOST"] }
        },
        _sum: { value: true },
      }),
      prisma.contact.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalContacts,
        contactsWithDeals,
        activeDealsValue: activeDealsValue._sum.value || 0,
        contactsThisMonth,
      },
    });
  } catch (error) {
    console.error("Get contact stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};