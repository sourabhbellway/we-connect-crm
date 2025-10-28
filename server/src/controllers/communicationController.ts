import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { TemplateType, TriggerType, MessageStatus } from '@prisma/client';
import { emailService } from '../services/EmailService';
import { whatsAppService } from '../services/WhatsAppService';
import { automationService } from '../services/AutomationService';

// Templates
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { type, active } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const whereClause: any = {
      deletedAt: null,
    };

    if (type) {
      whereClause.type = type as TemplateType;
    }

    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    const [templates, total] = await Promise.all([
      prisma.communicationTemplate.findMany({
        where: whereClause,
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.communicationTemplate.count({
        where: whereClause,
      }),
    ]);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message,
    });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, type, subject, content, variables, isDefault } = req.body;

    if (!name || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and content are required',
      });
    }

    // If setting as default, unset other default templates of same type
    if (isDefault) {
      await prisma.communicationTemplate.updateMany({
        where: {
          type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.communicationTemplate.create({
      data: {
        name,
        type,
        subject,
        content,
        variables,
        isDefault: isDefault || false,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: { template },
    });
  } catch (error: any) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message,
    });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject, content, variables, isActive, isDefault } = req.body;

    // If setting as default, unset other default templates of same type
    if (isDefault) {
      const template = await prisma.communicationTemplate.findUnique({
        where: { id: parseInt(id) },
      });

      if (template) {
        await prisma.communicationTemplate.updateMany({
          where: {
            type: template.type,
            isDefault: true,
            id: { not: parseInt(id) },
          },
          data: {
            isDefault: false,
          },
        });
      }
    }

    const template = await prisma.communicationTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        subject,
        content,
        variables,
        isActive,
        isDefault,
        updatedAt: new Date(),
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: { template },
    });
  } catch (error: any) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message,
    });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.communicationTemplate.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message,
    });
  }
};

// Messages
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId, to, subject, content, html, templateId } = req.body;

    if (!leadId || !to || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID, recipient, subject, and content are required',
      });
    }

    const messageId = await emailService.sendEmail({
      to,
      subject,
      content,
      html,
      leadId,
      userId,
      templateId,
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
      data: { messageId },
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
};

export const sendWhatsApp = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId, to, content, templateId, mediaUrls } = req.body;

    if (!leadId || !to || !content) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID, recipient, and content are required',
      });
    }

    const messageId = await whatsAppService.sendWhatsApp({
      to,
      content,
      leadId,
      userId,
      templateId,
      mediaUrls,
    });

    res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: { messageId },
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error.message,
    });
  }
};

export const sendTemplatedMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { templateId, leadId, variables } = req.body;

    if (!templateId || !leadId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and Lead ID are required',
      });
    }

    const template = await prisma.communicationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    let messageId: string;

    switch (template.type) {
      case TemplateType.EMAIL:
        messageId = await emailService.sendTemplatedEmail(templateId, leadId, userId, variables);
        break;
      case TemplateType.WHATSAPP:
        messageId = await whatsAppService.sendTemplatedWhatsApp(templateId, leadId, userId, variables);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Template type ${template.type} not supported`,
        });
    }

    res.json({
      success: true,
      message: 'Templated message sent successfully',
      data: { messageId },
    });
  } catch (error: any) {
    console.error('Error sending templated message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send templated message',
      error: error.message,
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { leadId, type, status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (leadId) {
      whereClause.leadId = parseInt(leadId as string);
    }

    if (type) {
      whereClause.type = type as TemplateType;
    }

    if (status) {
      whereClause.status = status as MessageStatus;
    }

    const [messages, total] = await Promise.all([
      prisma.communicationMessage.findMany({
        where: whereClause,
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.communicationMessage.count({
        where: whereClause,
      }),
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

export const getMessageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.communicationMessage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Get updated status from provider
    let status = message.status;
    try {
      if (message.type === TemplateType.EMAIL) {
        status = await emailService.getDeliveryStatus(message.id);
      } else if (message.type === TemplateType.WHATSAPP) {
        status = await whatsAppService.getDeliveryStatus(message.id);
      }
    } catch (error) {
      console.error('Error fetching delivery status:', error);
    }

    res.json({
      success: true,
      data: {
        messageId: message.id,
        status,
        sentAt: message.sentAt,
        deliveredAt: message.deliveredAt,
        readAt: message.readAt,
        failedAt: message.failedAt,
        errorMessage: message.errorMessage,
      },
    });
  } catch (error: any) {
    console.error('Error getting message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get message status',
      error: error.message,
    });
  }
};

// Automations
export const getAutomations = async (req: Request, res: Response) => {
  try {
    const { triggerType, active } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const whereClause: any = {
      deletedAt: null,
    };

    if (triggerType) {
      whereClause.triggerType = triggerType as TriggerType;
    }

    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    const [automations, total] = await Promise.all([
      prisma.communicationAutomation.findMany({
        where: whereClause,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.communicationAutomation.count({
        where: whereClause,
      }),
    ]);

    res.json({
      success: true,
      data: {
        automations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching automations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automations',
      error: error.message,
    });
  }
};

export const createAutomation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, triggerType, templateId, conditions, delay } = req.body;

    if (!name || !triggerType || !templateId) {
      return res.status(400).json({
        success: false,
        message: 'Name, trigger type, and template ID are required',
      });
    }

    const automation = await prisma.communicationAutomation.create({
      data: {
        name,
        triggerType,
        templateId,
        conditions,
        delay: delay || 0,
        createdBy: userId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Automation created successfully',
      data: { automation },
    });
  } catch (error: any) {
    console.error('Error creating automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create automation',
      error: error.message,
    });
  }
};

export const updateAutomation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, conditions, delay, isActive } = req.body;

    const automation = await prisma.communicationAutomation.update({
      where: { id: parseInt(id) },
      data: {
        name,
        conditions,
        delay,
        isActive,
        updatedAt: new Date(),
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Automation updated successfully',
      data: { automation },
    });
  } catch (error: any) {
    console.error('Error updating automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update automation',
      error: error.message,
    });
  }
};

export const deleteAutomation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.communicationAutomation.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Automation deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete automation',
      error: error.message,
    });
  }
};

export const testAutomation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID is required for testing',
      });
    }

    await automationService.testAutomation(parseInt(id), leadId, userId);

    res.json({
      success: true,
      message: 'Automation test executed successfully',
    });
  } catch (error: any) {
    console.error('Error testing automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test automation',
      error: error.message,
    });
  }
};

export const getAutomationStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dateFrom, dateTo } = req.query;

    const stats = await automationService.getAutomationStats(
      id ? parseInt(id) : undefined,
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching automation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation stats',
      error: error.message,
    });
  }
};

// Providers
export const getProviders = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const whereClause: any = {};
    if (type) {
      whereClause.type = type as TemplateType;
    }

    const providers = await prisma.communicationProvider.findMany({
      where: whereClause,
      orderBy: {
        type: 'asc',
      },
    });

    res.json({
      success: true,
      data: { providers },
    });
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers',
      error: error.message,
    });
  }
};

export const createProvider = async (req: Request, res: Response) => {
  try {
    const { name, type, provider, config, isActive, isDefault } = req.body;

    if (!name || !type || !provider || !config) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, provider, and config are required',
      });
    }

    // If setting as default, unset other default providers of same type
    if (isDefault) {
      await prisma.communicationProvider.updateMany({
        where: {
          type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newProvider = await prisma.communicationProvider.create({
      data: {
        name,
        type,
        config: {
          provider,
          ...config
        },
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Provider created successfully',
      data: { provider: newProvider },
    });
  } catch (error: any) {
    console.error('Error creating provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create provider',
      error: error.message,
    });
  }
};

export const updateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, config, isActive, isDefault } = req.body;

    const existingProvider = await prisma.communicationProvider.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProvider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // If setting as default, unset other default providers of same type
    if (isDefault) {
      await prisma.communicationProvider.updateMany({
        where: {
          type: existingProvider.type,
          isDefault: true,
          id: { not: parseInt(id) },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const provider = await prisma.communicationProvider.update({
      where: { id: parseInt(id) },
      data: {
        name,
        config,
        isActive,
        isDefault,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Provider updated successfully',
      data: { provider },
    });
  } catch (error: any) {
    console.error('Error updating provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update provider',
      error: error.message,
    });
  }
};

export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const provider = await prisma.communicationProvider.findUnique({
      where: { id: parseInt(id) },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Check if this provider is being used by any templates or automations
    const messageCount = await prisma.communicationMessage.count({
      where: {
        type: provider.type,
        status: 'PENDING'
      },
    });

    if (messageCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete provider that has pending messages',
      });
    }

    await prisma.communicationProvider.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Provider deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete provider',
      error: error.message,
    });
  }
};

export const testProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const provider = await prisma.communicationProvider.findUnique({
      where: { id: parseInt(id) },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    let isConnected = false;

    try {
      switch (provider.type) {
        case TemplateType.EMAIL:
          await emailService.initializeFromProvider(provider.id);
          isConnected = await emailService.testConnection();
          break;
        case TemplateType.WHATSAPP:
          await whatsAppService.initializeFromProvider(provider.id);
          isConnected = await whatsAppService.testConnection();
          break;
        default:
          return res.status(400).json({
            success: false,
            message: `Provider type ${provider.type} not supported for testing`,
          });
      }
    } catch (error: any) {
      console.error('Provider test failed:', error);
    }

    res.json({
      success: true,
      data: {
        providerId: provider.id,
        isConnected,
        message: isConnected ? 'Connection successful' : 'Connection failed',
      },
    });
  } catch (error: any) {
    console.error('Error testing provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test provider',
      error: error.message,
    });
  }
};