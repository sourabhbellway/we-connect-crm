import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';
import { EmailWebhookDto } from './dto/email-webhook.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listLeadComms(leadId: number) {
    const items = await this.prisma.leadCommunication.findMany({
      where: { leadId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: { items } };
  }

  async listMeetings(leadId: number) {
    const items = await this.prisma.leadCommunication.findMany({
      where: { 
        leadId,
        type: 'MEETING',
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: { items } };
  }

  async createLeadComm(dto: CreateLeadCommunicationDto) {
    const comm = await this.prisma.leadCommunication.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId,
        type: dto.type as any,
        subject: dto.subject ?? null,
        content: dto.content,
        direction: dto.direction ?? 'outbound',
        duration: dto.duration ?? null,
        outcome: dto.outcome ?? null,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Create activity for meeting/communication
    if (dto.type === 'MEETING' && dto.scheduledAt) {
      try {
        await this.prisma.activity.create({
          data: {
            title: 'Meeting scheduled',
            description: dto.subject 
              ? `Meeting "${dto.subject}" scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`
              : `Meeting scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`,
            type: 'COMMUNICATION_LOGGED' as any,
            icon: 'Calendar',
            iconColor: '#3B82F6',
            metadata: {
              leadId: dto.leadId,
              communicationId: comm.id,
              scheduledAt: dto.scheduledAt,
              type: 'MEETING',
            } as any,
            userId: dto.userId,
            leadId: dto.leadId,
          },
        });
      } catch (error) {
        console.error('Error creating meeting activity:', error);
      }
    }

    return { success: true, data: { communication: comm } };
  }

  // Templates
  async listTemplates({
    type,
    active,
    page = 1,
    limit = 10,
  }: {
    type?: string;
    active?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { deletedAt: null };
    if (type) where.type = type as any;
    if (active !== undefined) where.isActive = active === 'true';
    const [templates, total] = await Promise.all([
      this.prisma.communicationTemplate.findMany({
        where,
        include: {
          createdByUser: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.communicationTemplate.count({ where }),
    ]);
    return {
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
    };
  }

  async createTemplate(dto: UpsertTemplateDto) {
    if (dto.isDefault) {
      await this.prisma.communicationTemplate.updateMany({
        where: { type: dto.type as any, isDefault: true },
        data: { isDefault: false },
      });
    }
    const template = await this.prisma.communicationTemplate.create({
      data: {
        name: dto.name,
        type: dto.type as any,
        subject: dto.subject ?? null,
        content: dto.content,
        variables: (dto.variables as any) ?? undefined,
        isDefault: dto.isDefault ?? false,
        createdBy: dto.createdBy ?? 1,
      },
      include: {
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    return {
      success: true,
      message: 'Template created successfully',
      data: { template },
    };
  }

  async updateTemplate(id: number, dto: UpsertTemplateDto) {
    if (dto.isDefault) {
      const existing = await this.prisma.communicationTemplate.findUnique({
        where: { id },
      });
      if (existing) {
        await this.prisma.communicationTemplate.updateMany({
          where: { type: existing.type, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
    }
    const template = await this.prisma.communicationTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        subject: dto.subject,
        content: dto.content,
        variables: dto.variables as any,
        isActive: dto.isActive,
        isDefault: dto.isDefault,
        updatedAt: new Date(),
      },
      include: {
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    return {
      success: true,
      message: 'Template updated successfully',
      data: { template },
    };
  }

  async deleteTemplate(id: number) {
    await this.prisma.communicationTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Template deleted successfully' };
  }

  // Sends (stub create message records)
  async sendEmail(dto: SendEmailDto) {
    const message = await this.prisma.communicationMessage.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId ?? 1,
        templateId: dto.templateId ?? null,
        type: 'EMAIL' as any,
        recipient: dto.to,
        subject: dto.subject,
        content: dto.content,
        status: 'SENT' as any,
        sentAt: new Date(),
      },
    });
    return {
      success: true,
      message: 'Email sent successfully',
      data: { messageId: message.id },
    };
  }

  async sendWhatsApp(dto: SendWhatsAppDto) {
    const message = await this.prisma.communicationMessage.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId ?? 1,
        templateId: dto.templateId ?? null,
        type: 'WHATSAPP' as any,
        recipient: dto.to,
        content: dto.content,
        status: 'SENT' as any,
        sentAt: new Date(),
        metadata: (dto.mediaUrls
          ? { mediaUrls: dto.mediaUrls }
          : undefined) as any,
      },
    });
    return {
      success: true,
      message: 'WhatsApp message sent successfully',
      data: { messageId: message.id },
    };
  }

  private applyVariables(content: string, variables?: Record<string, unknown>) {
    if (!variables) return content;
    let out = content;
    for (const [k, v] of Object.entries(variables)) {
      out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
    }
    return out;
  }

  async sendTemplated(dto: SendTemplatedDto) {
    const template = await this.prisma.communicationTemplate.findUnique({
      where: { id: dto.templateId },
    });
    if (!template) return { success: false, message: 'Template not found' };
    const content = this.applyVariables(template.content, dto.variables as any);
    if (template.type === 'EMAIL') {
      return this.sendEmail({
        leadId: dto.leadId,
        to: '',
        subject: template.subject || 'Message',
        content,
        templateId: template.id,
        userId: dto.userId,
      });
    }
    if (template.type === 'WHATSAPP') {
      return this.sendWhatsApp({
        leadId: dto.leadId,
        to: '',
        content,
        templateId: template.id,
        userId: dto.userId,
      });
    }
    return {
      success: false,
      message: `Template type ${template.type} not supported`,
    };
  }

  async listMessages({
    leadId,
    type,
    status,
    page = 1,
    limit = 10,
  }: {
    leadId?: number;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (type) where.type = type as any;
    if (status) where.status = status as any;
    const [messages, total] = await Promise.all([
      this.prisma.communicationMessage.findMany({
        where,
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
          user: { select: { id: true, firstName: true, lastName: true } },
          template: { select: { id: true, name: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.communicationMessage.count({ where }),
    ]);
    return {
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
    };
  }

  // Webhook Handlers for Two-Way Communication
  async handleWhatsAppWebhook(dto: WhatsAppWebhookDto) {
    try {
      this.logger.log(`Received WhatsApp webhook from: ${dto.from}`);

      // Normalize phone number (remove +, spaces, etc.)
      const normalizedPhone = dto.from.replace(/[^0-9]/g, '');

      // Try to find lead by phone number
      const lead = await this.prisma.lead.findFirst({
        where: {
          phone: {
            contains: normalizedPhone,
          },
          deletedAt: null,
        },
      });

      if (!lead) {
        this.logger.warn(`No lead found for phone: ${dto.from}`);
        return {
          success: false,
          message: 'Lead not found for this phone number',
          data: { phone: dto.from },
        };
      }

      // Create inbound message record
      const message = await this.prisma.communicationMessage.create({
        data: {
          leadId: lead.id,
          userId: lead.assignedTo || 1,
          type: 'WHATSAPP' as any,
          recipient: dto.to || '',
          content: dto.content,
          status: 'DELIVERED' as any,
          sentAt: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          deliveredAt: new Date(),
          externalId: dto.messageId,
          metadata: {
            direction: 'inbound',
            from: dto.from,
            contactName: dto.contactName,
            messageType: dto.messageType,
            mediaUrls: dto.mediaUrls,
            ...dto.metadata,
          } as any,
        },
      });

      // Create activity log
      await this.prisma.activity.create({
        data: {
          title: 'WhatsApp Message Received',
          description: `Received message from ${dto.contactName || dto.from}: "${dto.content.substring(0, 100)}${dto.content.length > 100 ? '...' : ''}"`,
          type: 'COMMUNICATION_LOGGED' as any,
          icon: 'MessageCircle',
          iconColor: '#25D366',
          metadata: {
            leadId: lead.id,
            messageId: message.id,
            direction: 'inbound',
            type: 'WHATSAPP',
          } as any,
          userId: lead.assignedTo || 1,
          leadId: lead.id,
        },
      });

      this.logger.log(`WhatsApp message saved: ${message.id} for lead: ${lead.id}`);

      // Send notification to assigned user
      if (lead.assignedTo) {
        try {
          await this.notificationsService.create({
            userId: lead.assignedTo,
            type: NotificationType.CLIENT_REPLY,
            title: 'WhatsApp Reply Received',
            message: `${dto.contactName || dto.from} replied: "${dto.content.substring(0, 100)}${dto.content.length > 100 ? '...' : ''}"`,
            link: `/leads/${lead.id}`,
            metadata: { leadId: lead.id, messageId: message.id, type: 'WHATSAPP' },
          });
        } catch (error) {
          this.logger.error('Failed to send notification:', error);
        }
      }

      return {
        success: true,
        message: 'WhatsApp message received and saved',
        data: { messageId: message.id, leadId: lead.id },
      };
    } catch (error) {
      this.logger.error('Error processing WhatsApp webhook:', error);
      return {
        success: false,
        message: 'Failed to process WhatsApp webhook',
        error: error.message,
      };
    }
  }

  async handleEmailWebhook(dto: EmailWebhookDto) {
    try {
      this.logger.log(`Received email webhook from: ${dto.from}`);

      // Try to find lead by email
      const lead = await this.prisma.lead.findFirst({
        where: {
          email: {
            equals: dto.from,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
      });

      if (!lead) {
        this.logger.warn(`No lead found for email: ${dto.from}`);
        return {
          success: false,
          message: 'Lead not found for this email address',
          data: { email: dto.from },
        };
      }

      // Use HTML content if available, otherwise text content, otherwise general content
      const emailContent = dto.htmlContent || dto.textContent || dto.content;

      // Create inbound message record
      const message = await this.prisma.communicationMessage.create({
        data: {
          leadId: lead.id,
          userId: lead.assignedTo || 1,
          type: 'EMAIL' as any,
          recipient: dto.to || '',
          subject: dto.subject,
          content: emailContent,
          status: 'DELIVERED' as any,
          sentAt: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          deliveredAt: new Date(),
          externalId: dto.messageId,
          metadata: {
            direction: 'inbound',
            from: dto.from,
            fromName: dto.fromName,
            inReplyTo: dto.inReplyTo,
            references: dto.references,
            attachments: dto.attachments,
            cc: dto.cc,
            bcc: dto.bcc,
            textContent: dto.textContent,
            htmlContent: dto.htmlContent,
            ...dto.metadata,
          } as any,
        },
      });

      // Create activity log
      await this.prisma.activity.create({
        data: {
          title: 'Email Received',
          description: `Received email from ${dto.fromName || dto.from}: "${dto.subject}"`,
          type: 'COMMUNICATION_LOGGED' as any,
          icon: 'Mail',
          iconColor: '#3B82F6',
          metadata: {
            leadId: lead.id,
            messageId: message.id,
            direction: 'inbound',
            type: 'EMAIL',
            subject: dto.subject,
          } as any,
          userId: lead.assignedTo || 1,
          leadId: lead.id,
        },
      });

      this.logger.log(`Email message saved: ${message.id} for lead: ${lead.id}`);

      // Send notification to assigned user
      if (lead.assignedTo) {
        try {
          await this.notificationsService.create({
            userId: lead.assignedTo,
            type: NotificationType.CLIENT_REPLY,
            title: 'Email Reply Received',
            message: `${dto.fromName || dto.from} replied: "${dto.subject}"`,
            link: `/leads/${lead.id}`,
            metadata: { leadId: lead.id, messageId: message.id, type: 'EMAIL' },
          });
        } catch (error) {
          this.logger.error('Failed to send notification:', error);
        }
      }

      return {
        success: true,
        message: 'Email received and saved',
        data: { messageId: message.id, leadId: lead.id },
      };
    } catch (error) {
      this.logger.error('Error processing email webhook:', error);
      return {
        success: false,
        message: 'Failed to process email webhook',
        error: error.message,
      };
    }
  }

  // Get webhook URLs (for documentation/configuration)
  getWebhookUrls(baseUrl: string) {
    return {
      success: true,
      data: {
        whatsapp: `${baseUrl}/communications/webhooks/whatsapp`,
        email: `${baseUrl}/communications/webhooks/email`,
        instructions: {
          whatsapp: 'Configure this URL in your WhatsApp Business API provider webhook settings',
          email: 'Configure this URL as the inbound webhook in your email provider (e.g., SendGrid, Mailgun)',
        },
      },
    };
  }
}
