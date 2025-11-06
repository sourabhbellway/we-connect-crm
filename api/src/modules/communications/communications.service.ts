import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';

@Injectable()
export class CommunicationsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
