"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CommunicationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const permission_util_1 = require("../../common/utils/permission.util");
let CommunicationsService = CommunicationsService_1 = class CommunicationsService {
    prisma;
    notificationsService;
    logger = new common_1.Logger(CommunicationsService_1.name);
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async listLeadComms(leadId, user) {
        const where = { leadId };
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma, ['userId']);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        const items = await this.prisma.leadCommunication.findMany({
            where,
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { items } };
    }
    async listMeetings(leadId, user) {
        const where = {
            leadId,
            type: 'MEETING',
        };
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma, ['userId']);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        const items = await this.prisma.leadCommunication.findMany({
            where,
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { items } };
    }
    async createLeadComm(dto) {
        const comm = await this.prisma.leadCommunication.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId,
                type: dto.type,
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
        if (dto.type === 'MEETING' && dto.scheduledAt) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Meeting scheduled',
                        description: dto.subject
                            ? `Meeting \"${dto.subject}\" scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`
                            : `Meeting scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`,
                        type: 'COMMUNICATION_LOGGED',
                        icon: 'Calendar',
                        iconColor: '#3B82F6',
                        metadata: {
                            leadId: dto.leadId,
                            communicationId: comm.id,
                            scheduledAt: dto.scheduledAt,
                            type: 'MEETING',
                        },
                        userId: dto.userId,
                        leadId: dto.leadId,
                    },
                });
                const lead = await this.prisma.lead.findUnique({
                    where: { id: dto.leadId },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        assignedTo: true
                    },
                });
                if (lead) {
                    if (lead.assignedTo) {
                        await this.notificationsService.create({
                            userId: lead.assignedTo,
                            type: client_1.NotificationType.MEETING_SCHEDULED,
                            title: 'Meeting Scheduled',
                            message: `A meeting has been scheduled with lead "${lead.firstName} ${lead.lastName}" on ${new Date(dto.scheduledAt).toLocaleString()}.`,
                            link: `/leads/${lead.id}`,
                            metadata: {
                                leadId: lead.id,
                                communicationId: comm.id,
                                scheduledAt: dto.scheduledAt,
                            },
                        });
                    }
                    if (lead.email) {
                        try {
                            await this.sendMeetingEmail({
                                leadEmail: lead.email,
                                meetingTitle: dto.subject || 'Meeting',
                                meetingDate: new Date(dto.scheduledAt).toLocaleDateString(),
                                meetingTime: new Date(dto.scheduledAt).toLocaleTimeString(),
                                location: dto.content?.includes('Location:') ? dto.content.split('Location:')[1]?.split('\n')[0]?.trim() : undefined,
                                link: dto.content?.includes('Link:') ? dto.content.split('Link:')[1]?.split('\n')[0]?.trim() : undefined,
                                notes: dto.content?.includes('Notes:') ? dto.content.split('Notes:')[1]?.trim() : undefined,
                                leadId: dto.leadId,
                                userId: dto.userId,
                            });
                        }
                        catch (emailError) {
                            this.logger.warn('Failed to send meeting email to lead:', emailError);
                        }
                    }
                }
            }
            catch (error) {
                this.logger.error('Error creating meeting activity or notification:', error);
            }
        }
        return { success: true, data: { communication: comm } };
    }
    async listTemplates({ type, active, page = 1, limit = 10, }, user) {
        const where = { deletedAt: null };
        if (type)
            where.type = type;
        if (active !== undefined)
            where.isActive = active === 'true';
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma, ['createdBy']);
            if (Object.keys(roleBasedWhere).length > 0) {
                if (where.AND) {
                    where.AND.push(roleBasedWhere);
                }
                else {
                    where.AND = [roleBasedWhere];
                }
            }
        }
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
    async createTemplate(dto) {
        if (dto.isDefault) {
            await this.prisma.communicationTemplate.updateMany({
                where: { type: dto.type, isDefault: true },
                data: { isDefault: false },
            });
        }
        const template = await this.prisma.communicationTemplate.create({
            data: {
                name: dto.name,
                type: dto.type,
                subject: dto.subject ?? null,
                content: dto.content,
                variables: dto.variables ?? undefined,
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
    async updateTemplate(id, dto) {
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
                variables: dto.variables,
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
    async deleteTemplate(id) {
        await this.prisma.communicationTemplate.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Template deleted successfully' };
    }
    async sendEmail(dto) {
        let sendStatus = 'SENT';
        try {
            let host;
            let port;
            let user;
            let pass;
            let from;
            let fromName;
            try {
                const provider = await this.prisma.communicationProvider.findFirst({
                    where: {
                        type: 'EMAIL',
                        isActive: true,
                        isDefault: true,
                    },
                });
                if (provider) {
                    const cfg = provider.config || {};
                    this.logger.log(`Loading SMTP config from Communication Provider: ${provider.name} (ID: ${provider.id})`);
                    host = cfg.smtpHost || cfg.host || cfg.EMAIL_HOST;
                    port = cfg.smtpPort ? Number(cfg.smtpPort) : (cfg.port ? Number(cfg.port) : (cfg.EMAIL_PORT ? Number(cfg.EMAIL_PORT) : 587));
                    user = cfg.smtpUser || cfg.username || cfg.EMAIL_HOST_USER || cfg.user;
                    pass = cfg.smtpPassword || cfg.password || cfg.EMAIL_HOST_PASSWORD || cfg.pass;
                    from = cfg.fromEmail || cfg.from || cfg.smtpUser || cfg.EMAIL_FROM || user;
                    fromName = cfg.fromName || cfg.from_name;
                    this.logger.log(`SMTP Config loaded - Host: ${host ? '✓' : '✗'}, Port: ${port}, User: ${user ? '✓' : '✗'}, From: ${from ? '✓' : '✗'}`);
                    if (host && user && pass && from) {
                        this.logger.log(`Using SMTP configuration from Communication Provider: ${provider.name}`);
                    }
                    else {
                        this.logger.warn(`Communication Provider config incomplete. Missing: ${!host ? 'host ' : ''}${!user ? 'user ' : ''}${!pass ? 'password ' : ''}${!from ? 'from ' : ''}`);
                    }
                }
                else {
                    this.logger.log('No active default EMAIL provider found in Communication Providers');
                }
            }
            catch (err) {
                this.logger.error('Failed to load email provider from communication_providers', err?.stack || err);
            }
            if (!host || !user || !pass || !from) {
                host = host || process.env.EMAIL_HOST || process.env.SMTP_HOST;
                port = port || (process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) :
                    (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587));
                user = user || process.env.EMAIL_HOST_USER || process.env.SMTP_USER;
                pass = pass || process.env.EMAIL_HOST_PASSWORD || process.env.SMTP_PASS;
                from = from || process.env.EMAIL_FROM || process.env.SMTP_FROM || user;
            }
            if (!host || !user || !pass || !from) {
                this.logger.warn('SMTP configuration incomplete (from provider or env); skipping outbound email send');
                sendStatus = 'FAILED';
            }
            else {
                const nodemailer = require('nodemailer');
                const useTLS = process.env.EMAIL_USE_TLS === 'True' || process.env.EMAIL_USE_TLS === 'true' ||
                    process.env.EMAIL_USE_TLS === '1' ||
                    (process.env.EMAIL_USE_TLS === undefined && (port ?? 587) !== 465);
                const transporter = nodemailer.createTransport({
                    host,
                    port: port ?? 587,
                    secure: (port ?? 587) === 465,
                    auth: { user, pass },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                const fromHeader = fromName ? `${fromName} <${from}>` : from;
                const textBody = dto.content;
                const htmlBody = dto.html || undefined;
                await transporter.sendMail({
                    from: fromHeader,
                    to: dto.to,
                    subject: dto.subject,
                    text: textBody,
                    html: htmlBody,
                });
                this.logger.log(`Outbound email sent to ${dto.to} for leadId=${dto.leadId}`);
            }
        }
        catch (error) {
            sendStatus = 'FAILED';
            this.logger.error(`Failed to send outbound email to ${dto.to}`, error?.stack || error);
        }
        const message = await this.prisma.communicationMessage.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId ?? 1,
                templateId: dto.templateId ?? null,
                type: 'EMAIL',
                recipient: dto.to,
                subject: dto.subject,
                content: dto.content,
                status: sendStatus,
                sentAt: new Date(),
            },
        });
        return {
            success: sendStatus === 'SENT',
            message: sendStatus === 'SENT' ? 'Email sent successfully' : 'Failed to send email via SMTP',
            data: { messageId: message.id },
        };
    }
    async sendWhatsApp(dto) {
        const message = await this.prisma.communicationMessage.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId ?? 1,
                templateId: dto.templateId ?? null,
                type: 'WHATSAPP',
                recipient: dto.to,
                content: dto.content,
                status: 'SENT',
                sentAt: new Date(),
                metadata: (dto.mediaUrls
                    ? { mediaUrls: dto.mediaUrls }
                    : undefined),
            },
        });
        return {
            success: true,
            message: 'WhatsApp message sent successfully',
            data: { messageId: message.id },
        };
    }
    applyVariables(content, variables) {
        if (!variables)
            return content;
        let out = content;
        for (const [k, v] of Object.entries(variables)) {
            out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
        }
        return out;
    }
    async sendTemplated(dto) {
        const template = await this.prisma.communicationTemplate.findUnique({
            where: { id: dto.templateId },
        });
        if (!template)
            return { success: false, message: 'Template not found' };
        const lead = await this.prisma.lead.findUnique({
            where: { id: dto.leadId },
            select: { email: true, phone: true },
        });
        if (!lead) {
            return { success: false, message: 'Lead not found' };
        }
        const content = this.applyVariables(template.content, dto.variables);
        if (template.type === 'EMAIL') {
            if (!lead.email) {
                return { success: false, message: 'Lead email not found' };
            }
            return this.sendEmail({
                leadId: dto.leadId,
                to: lead.email,
                subject: template.subject || 'Message',
                content,
                templateId: template.id,
                userId: dto.userId,
            });
        }
        if (template.type === 'WHATSAPP') {
            if (!lead.phone) {
                return { success: false, message: 'Lead phone not found' };
            }
            return this.sendWhatsApp({
                leadId: dto.leadId,
                to: lead.phone,
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
    async listMessages({ leadId, type, status, page = 1, limit = 10, }, user) {
        const where = {};
        if (leadId)
            where.leadId = leadId;
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma, ['userId']);
            if (Object.keys(roleBasedWhere).length > 0) {
                if (where.AND) {
                    where.AND.push(roleBasedWhere);
                }
                else {
                    where.AND = [roleBasedWhere];
                }
            }
        }
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
    async handleWhatsAppWebhook(dto) {
        try {
            this.logger.log(`Received WhatsApp webhook from: ${dto.from}`);
            const normalizedPhone = dto.from.replace(/[^0-9]/g, '');
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
            const message = await this.prisma.communicationMessage.create({
                data: {
                    leadId: lead.id,
                    userId: lead.assignedTo || 1,
                    type: 'WHATSAPP',
                    recipient: dto.to || '',
                    content: dto.content,
                    status: 'DELIVERED',
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
                    },
                },
            });
            await this.prisma.activity.create({
                data: {
                    title: 'WhatsApp Message Received',
                    description: `Received message from ${dto.contactName || dto.from}: "${dto.content.substring(0, 100)}${dto.content.length > 100 ? '...' : ''}"`,
                    type: 'COMMUNICATION_LOGGED',
                    icon: 'MessageCircle',
                    iconColor: '#25D366',
                    metadata: {
                        leadId: lead.id,
                        messageId: message.id,
                        direction: 'inbound',
                        type: 'WHATSAPP',
                    },
                    userId: lead.assignedTo || 1,
                    leadId: lead.id,
                },
            });
            this.logger.log(`WhatsApp message saved: ${message.id} for lead: ${lead.id}`);
            if (lead.assignedTo) {
                try {
                    await this.notificationsService.create({
                        userId: lead.assignedTo,
                        type: client_1.NotificationType.CLIENT_REPLY,
                        title: 'WhatsApp Reply Received',
                        message: `${dto.contactName || dto.from} replied: "${dto.content.substring(0, 100)}${dto.content.length > 100 ? '...' : ''}"`,
                        link: `/leads/${lead.id}`,
                        metadata: { leadId: lead.id, messageId: message.id, type: 'WHATSAPP' },
                    });
                }
                catch (error) {
                    this.logger.error('Failed to send notification:', error);
                }
            }
            return {
                success: true,
                message: 'WhatsApp message received and saved',
                data: { messageId: message.id, leadId: lead.id },
            };
        }
        catch (error) {
            this.logger.error('Error processing WhatsApp webhook:', error);
            return {
                success: false,
                message: 'Failed to process WhatsApp webhook',
                error: error.message,
            };
        }
    }
    async handleEmailWebhook(dto) {
        try {
            this.logger.log(`Received email webhook from: ${dto.from}`);
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
            const emailContent = dto.htmlContent || dto.textContent || dto.content;
            const message = await this.prisma.communicationMessage.create({
                data: {
                    leadId: lead.id,
                    userId: lead.assignedTo || 1,
                    type: 'EMAIL',
                    recipient: dto.to || '',
                    subject: dto.subject,
                    content: emailContent,
                    status: 'DELIVERED',
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
                    },
                },
            });
            await this.prisma.activity.create({
                data: {
                    title: 'Email Received',
                    description: `Received email from ${dto.fromName || dto.from}: "${dto.subject}"`,
                    type: 'COMMUNICATION_LOGGED',
                    icon: 'Mail',
                    iconColor: '#3B82F6',
                    metadata: {
                        leadId: lead.id,
                        messageId: message.id,
                        direction: 'inbound',
                        type: 'EMAIL',
                        subject: dto.subject,
                    },
                    userId: lead.assignedTo || 1,
                    leadId: lead.id,
                },
            });
            this.logger.log(`Email message saved: ${message.id} for lead: ${lead.id}`);
            if (lead.assignedTo) {
                try {
                    await this.notificationsService.create({
                        userId: lead.assignedTo,
                        type: client_1.NotificationType.CLIENT_REPLY,
                        title: 'Email Reply Received',
                        message: `${dto.fromName || dto.from} replied: "${dto.subject}"`,
                        link: `/leads/${lead.id}`,
                        metadata: { leadId: lead.id, messageId: message.id, type: 'EMAIL' },
                    });
                }
                catch (error) {
                    this.logger.error('Failed to send notification:', error);
                }
            }
            return {
                success: true,
                message: 'Email received and saved',
                data: { messageId: message.id, leadId: lead.id },
            };
        }
        catch (error) {
            this.logger.error('Error processing email webhook:', error);
            return {
                success: false,
                message: 'Failed to process email webhook',
                error: error.message,
            };
        }
    }
    getWebhookUrls(baseUrl) {
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
    async sendMeetingEmail(body) {
        try {
            const { leadEmail, meetingTitle, meetingDate, meetingTime, location, link, notes, leadId, userId } = body;
            if (!leadEmail) {
                return { success: false, message: 'Lead email is required' };
            }
            let emailContent = `<h2>Meeting Scheduled: ${meetingTitle}</h2>`;
            emailContent += `<p><strong>Date:</strong> ${meetingDate}</p>`;
            emailContent += `<p><strong>Time:</strong> ${meetingTime}</p>`;
            if (location) {
                emailContent += `<p><strong>Location:</strong> ${location}</p>`;
            }
            if (link) {
                emailContent += `<p><strong>Meeting Link:</strong> <a href="${link}">${link}</a></p>`;
            }
            if (notes) {
                emailContent += `<p><strong>Notes:</strong> ${notes}</p>`;
            }
            try {
                await this.sendEmail({
                    leadId: leadId || 1,
                    userId: userId || 1,
                    to: leadEmail,
                    subject: `Meeting Scheduled: ${meetingTitle}`,
                    content: emailContent,
                    html: emailContent,
                });
            }
            catch (emailErr) {
                this.logger.warn('Failed to send meeting email:', emailErr);
            }
            return { success: true, message: 'Meeting email sent to lead' };
        }
        catch (error) {
            this.logger.error('Error sending meeting email:', error);
            return { success: false, message: 'Failed to send meeting email', error: error.message };
        }
    }
};
exports.CommunicationsService = CommunicationsService;
exports.CommunicationsService = CommunicationsService = CommunicationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], CommunicationsService);
//# sourceMappingURL=communications.service.js.map