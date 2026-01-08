import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';
import { EmailWebhookDto } from './dto/email-webhook.dto';
import { InitiateVoIPCallDto } from './dto/initiate-voip-call.dto';
import { VoIPWebhookDto } from './dto/voip-webhook.dto';
import { VoIPConfigDto } from './dto/voip-config.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';

@Injectable()
export class CommunicationsService {
    private readonly logger = new Logger(CommunicationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async listLeadComms(leadId: number, user?: any) {
        const where: any = { leadId };

        // Role-based filtering
        if (user && user.userId) {
            const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
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

    async listMeetings(leadId: number, user?: any) {
        const where: any = {
            leadId,
            type: 'MEETING',
        };

        // Role-based filtering
        if (user && user.userId) {
            const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
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
                            ? `Meeting \"${dto.subject}\" scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`
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

                // Get lead details for email and notification
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
                    // Notify assigned user about the scheduled meeting
                    if (lead.assignedTo) {
                        await this.notificationsService.create({
                            userId: lead.assignedTo,
                            type: NotificationType.MEETING_SCHEDULED,
                            title: 'Meeting Scheduled',
                            message: `A meeting has been scheduled with lead "${lead.firstName} ${lead.lastName}" on ${new Date(
                                dto.scheduledAt,
                            ).toLocaleString()}.`,
                            link: `/leads/${lead.id}`,
                            metadata: {
                                leadId: lead.id,
                                communicationId: comm.id,
                                scheduledAt: dto.scheduledAt,
                            } as any,
                        });
                    }

                    // Send email to lead about the meeting
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
                        } catch (emailError) {
                            this.logger.warn('Failed to send meeting email to lead:', emailError);
                            // Don't fail the meeting creation if email fails
                        }
                    }
                }
            } catch (error) {
                this.logger.error('Error creating meeting activity or notification:', error);
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
    }, user?: any) {
        const where: any = { deletedAt: null };
        if (type) where.type = type as any;
        if (active !== undefined) where.isActive = active === 'true';

        // Role-based filtering
        if (user && user.userId) {
            const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['createdBy']);
            if (Object.keys(roleBasedWhere).length > 0) {
                if (where.AND) {
                    where.AND.push(roleBasedWhere);
                } else {
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

    // Sends real outbound email using default EMAIL communication provider (or ENV SMTP)
    async sendEmail(dto: SendEmailDto) {
        let sendStatus: 'SENT' | 'FAILED' = 'SENT';

        try {
            // Load SMTP configuration from communication_providers (same model used for welcome emails)
            let host: string | undefined;
            let port: number | undefined;
            let user: string | undefined;
            let pass: string | undefined;
            let from: string | undefined;
            let fromName: string | undefined;

            try {
                const provider = await this.prisma.communicationProvider.findFirst({
                    where: {
                        type: 'EMAIL',
                        isActive: true,
                        isDefault: true,
                    },
                });

                if (provider) {
                    const cfg = (provider as any).config || {};
                    this.logger.log(`Loading SMTP config from Communication Provider: ${provider.name} (ID: ${provider.id})`);

                    // Try multiple field name variations to support different config formats
                    host = cfg.smtpHost || cfg.host || cfg.EMAIL_HOST;
                    port = cfg.smtpPort ? Number(cfg.smtpPort) : (cfg.port ? Number(cfg.port) : (cfg.EMAIL_PORT ? Number(cfg.EMAIL_PORT) : 587));
                    user = cfg.smtpUser || cfg.username || cfg.EMAIL_HOST_USER || cfg.user;
                    pass = cfg.smtpPassword || cfg.password || cfg.EMAIL_HOST_PASSWORD || cfg.pass;
                    from = cfg.fromEmail || cfg.from || cfg.smtpUser || cfg.EMAIL_FROM || user;
                    fromName = cfg.fromName || cfg.from_name;

                    this.logger.log(`SMTP Config loaded - Host: ${host ? '✓' : '✗'}, Port: ${port}, User: ${user ? '✓' : '✗'}, From: ${from ? '✓' : '✗'}`);

                    if (host && user && pass && from) {
                        this.logger.log(`Using SMTP configuration from Communication Provider: ${provider.name}`);
                    } else {
                        this.logger.warn(`Communication Provider config incomplete. Missing: ${!host ? 'host ' : ''}${!user ? 'user ' : ''}${!pass ? 'password ' : ''}${!from ? 'from ' : ''}`);
                    }
                } else {
                    this.logger.log('No active default EMAIL provider found in Communication Providers');
                }
            } catch (err) {
                this.logger.error('Failed to load email provider from communication_providers', err?.stack || err);
            }

            // Fallback to legacy ENV configuration if provider not configured or incomplete
            // Support both EMAIL_* and SMTP_* environment variable formats
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
            } else {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const nodemailer = require('nodemailer');
                // Check if TLS should be used (EMAIL_USE_TLS or default to true for port 587)
                const useTLS = process.env.EMAIL_USE_TLS === 'True' || process.env.EMAIL_USE_TLS === 'true' ||
                    process.env.EMAIL_USE_TLS === '1' ||
                    (process.env.EMAIL_USE_TLS === undefined && (port ?? 587) !== 465);

                const transporter = nodemailer.createTransport({
                    host,
                    port: port ?? 587,
                    secure: (port ?? 587) === 465, // true for 465, false for other ports
                    auth: { user, pass },
                    tls: {
                        // Do not fail on invalid certs (useful for self-signed certificates)
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
        } catch (error) {
            sendStatus = 'FAILED';
            this.logger.error(`Failed to send outbound email to ${dto.to}`, (error as any)?.stack || error);
        }

        const message = await this.prisma.communicationMessage.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId ?? 1,
                templateId: dto.templateId ?? null,
                type: 'EMAIL' as any,
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

        // Fetch lead details to get email/phone
        const lead = await this.prisma.lead.findUnique({
            where: { id: dto.leadId },
            select: { email: true, phone: true },
        });

        if (!lead) {
            return { success: false, message: 'Lead not found' };
        }

        const content = this.applyVariables(template.content, dto.variables as any);

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
    }, user?: any) {
        const where: any = {};
        if (leadId) where.leadId = leadId;
        if (type) where.type = type as any;
        if (status) where.status = status as any;

        // Role-based filtering
        if (user && user.userId) {
            const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
            if (Object.keys(roleBasedWhere).length > 0) {
                if (where.AND) {
                    where.AND.push(roleBasedWhere);
                } else {
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

    async sendMeetingEmail(body: any) {
        try {
            const { leadEmail, meetingTitle, meetingDate, meetingTime, location, link, notes, leadId, userId } = body;

            if (!leadEmail) {
                return { success: false, message: 'Lead email is required' };
            }

            // Format meeting email content
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

            // Send email using the existing email infrastructure
            try {
                await this.sendEmail({
                    leadId: leadId || 1,
                    userId: userId || 1,
                    to: leadEmail,
                    subject: `Meeting Scheduled: ${meetingTitle}`,
                    content: emailContent,
                    html: emailContent,
                });
            } catch (emailErr) {
                this.logger.warn('Failed to send meeting email:', emailErr);
                // Don't fail the whole operation if email send fails
            }

            return { success: true, message: 'Meeting email sent to lead' };
        } catch (error) {
            this.logger.error('Error sending meeting email:', error);
            return { success: false, message: 'Failed to send meeting email', error: error.message };
        }
    }

    // VoIP Configuration Management
    async getVoIPConfig() {
        try {
            const config = await this.prisma.voIPConfiguration.findFirst({
                where: { isActive: true },
            });

            if (!config) {
                return {
                    success: false,
                    message: 'VoIP configuration not found',
                };
            }

            return {
                success: true,
                data: { config },
            };
        } catch (error) {
            this.logger.error('Error fetching VoIP config:', error);
            return {
                success: false,
                message: 'Failed to fetch VoIP configuration',
                error: error.message,
            };
        }
    }

    async saveVoIPConfig(dto: VoIPConfigDto) {
        try {
            // Check if config already exists
            const existingConfig = await this.prisma.voIPConfiguration.findFirst();

            let config;
            if (existingConfig) {
                // Update existing config
                config = await this.prisma.voIPConfiguration.update({
                    where: { id: existingConfig.id },
                    data: {
                        provider: dto.provider,
                        apiKey: dto.apiKey,
                        apiSecret: dto.apiSecret,
                        accountSid: dto.accountSid,
                        authToken: dto.authToken,
                        regions: dto.regions,
                        defaultRegion: dto.defaultRegion,
                        enableCallRecording: dto.enableCallRecording,
                        recordingStorage: dto.recordingStorage,
                        enableVideoCalls: dto.enableVideoCalls,
                        isActive: dto.isActive !== undefined ? dto.isActive : true,
                        metadata: dto.metadata as any,
                    },
                });
            } else {
                // Create new config
                config = await this.prisma.voIPConfiguration.create({
                    data: {
                        provider: dto.provider,
                        apiKey: dto.apiKey,
                        apiSecret: dto.apiSecret,
                        accountSid: dto.accountSid,
                        authToken: dto.authToken,
                        regions: dto.regions,
                        defaultRegion: dto.defaultRegion,
                        enableCallRecording: dto.enableCallRecording,
                        recordingStorage: dto.recordingStorage,
                        enableVideoCalls: dto.enableVideoCalls,
                        isActive: dto.isActive !== undefined ? dto.isActive : true,
                        metadata: dto.metadata as any,
                    },
                });
            }

            return {
                success: true,
                message: 'VoIP configuration saved successfully',
                data: { config },
            };
        } catch (error) {
            this.logger.error('Error saving VoIP config:', error);
            return {
                success: false,
                message: 'Failed to save VoIP configuration',
                error: error.message,
            };
        }
    }

    // VoIP Call Initiation
    async initiateVoIPCall(dto: InitiateVoIPCallDto) {
        try {
            // Get VoIP configuration
            const config = await this.prisma.voIPConfiguration.findFirst({
                where: { isActive: true },
            });

            if (!config) {
                return {
                    success: false,
                    message: 'VoIP provider not configured',
                };
            }

            const callId = `call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            let token = null;

            // Generate Twilio Token if provider is twilio
            if (config.provider === 'twilio' && config.accountSid && config.apiKey && config.apiSecret) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const Twilio = require('twilio');
                    const AccessToken = Twilio.jwt.AccessToken;
                    const VoiceGrant = AccessToken.VoiceGrant;

                    // Create an Access Token
                    const accessToken = new AccessToken(
                        config.accountSid,
                        config.apiKey,
                        config.apiSecret,
                        { identity: `user_${dto.userId}` }
                    );

                    // Create a Voice Grant for this specific call (outgoing)
                    // We rely on metadata or config for TwiML App SID
                    // It should be stored in config.metadata.twimlAppSid
                    const twimlAppSid = (config.metadata as any)?.twimlAppSid;

                    if (twimlAppSid) {
                        const voiceGrant = new VoiceGrant({
                            outgoingApplicationSid: twimlAppSid,
                            incomingAllow: true, // Allow incoming calls
                        });
                        accessToken.addGrant(voiceGrant);
                        token = accessToken.toJwt();
                    } else {
                        this.logger.warn('TwiML App SID not found in VoIP Configuration metadata. Outbound calls may fail.');
                    }
                } catch (error) {
                    this.logger.error('Error generating Twilio token:', error);
                }
            }

            // Log the call initiation
            const callLog = await this.prisma.voIPCall.create({
                data: {
                    callId: callId,
                    leadId: dto.leadId,
                    userId: dto.userId,
                    phoneNumber: dto.phoneNumber,
                    callType: dto.callType,
                    status: 'initiated',
                    region: dto.region || config.defaultRegion || 'india',
                    isRecorded: dto.recordCall || false,
                    provider: config.provider,
                    metadata: {
                        ...dto.metadata as any,
                        isTwilio: config.provider === 'twilio'
                    },
                },
            });

            // Create activity log
            await this.prisma.activity.create({
                data: {
                    type: 'COMMUNICATION_LOGGED',
                    title: `${dto.callType === 'video' ? 'Video' : 'VoIP'} Call Initiated`,
                    description: `Initiated ${dto.callType} call to ${dto.phoneNumber}`,
                    icon: dto.callType === 'video' ? 'Video' : 'Phone',
                    iconColor: '#10B981',
                    metadata: {
                        callId: callId,
                        leadId: dto.leadId,
                        phoneNumber: dto.phoneNumber,
                        callType: dto.callType,
                        type: 'VOIP_CALL',
                    } as any,
                    userId: dto.userId,
                    leadId: dto.leadId,
                },
            });

            return {
                success: true,
                message: `${dto.callType === 'video' ? 'Video' : 'VoIP'} call initiated successfully`,
                data: {
                    callId: callId,
                    callLogId: callLog.id,
                    provider: config.provider,
                    token: token, // Return the generated token
                },
            };
        } catch (error) {
            this.logger.error('Error initiating VoIP call:', error);
            return {
                success: false,
                message: 'Failed to initiate VoIP call',
                error: error.message,
            };
        }
    }

    // TwiML Generator for Outbound Calls
    async generateTwiML(body: any) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Twilio = require('twilio');
            const VoiceResponse = Twilio.twiml.VoiceResponse;
            const response = new VoiceResponse();

            const { To, CallId, Region } = body;

            // Simple Dial to the number
            // Ideally should check callerId from config
            if (To) {
                const dial = response.dial({
                    callerId: process.env.TWILIO_OD_NUMBER || undefined, // Set your Twilio number here
                    answerOnBridge: true,
                });
                // Check if number is valid
                dial.number(To);
            } else {
                response.say('Invalid phone number.');
            }

            return response.toString();
        } catch (error) {
            this.logger.error('Error generating TwiML:', error);
            // Return valid XML failure
            return '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Error generating call instructions.</Say></Response>';
        }
    }

    // VoIP Webhook Handler
    async handleVoIPWebhook(dto: VoIPWebhookDto) {
        try {
            this.logger.log(`Received VoIP webhook for call: ${dto.callId}, status: ${dto.status}`);

            // Find the call log
            const callLog = await this.prisma.voIPCall.findFirst({
                where: { callId: dto.callId },
            });

            if (!callLog) {
                this.logger.warn(`No VoIP call found for callId: ${dto.callId}`);
                return {
                    success: false,
                    message: 'VoIP call not found',
                    data: { callId: dto.callId },
                };
            }

            // Update call status
            const updatedCall = await this.prisma.voIPCall.update({
                where: { id: callLog.id },
                data: {
                    status: dto.status,
                    duration: dto.duration,
                    endTime: dto.status === 'completed' ? new Date() : undefined,
                    recordingUrl: dto.recordingUrl,
                    isRecorded: dto.isRecorded,
                    errorMessage: dto.errorMessage,
                    errorCode: dto.errorCode,
                    metadata: {
                        ...(callLog.metadata as any),
                        ...(dto.metadata as any),
                        webhookReceivedAt: new Date().toISOString(),
                    } as any,
                },
            });

            // Create activity log for call status update
            await this.prisma.activity.create({
                data: {
                    type: 'COMMUNICATION_LOGGED',
                    title: `VoIP Call ${dto.status.charAt(0).toUpperCase() + dto.status.slice(1)}`,
                    description: `VoIP call ${dto.status} with ${callLog.phoneNumber}`,
                    icon: 'Phone',
                    iconColor: this.getCallStatusColor(dto.status),
                    metadata: {
                        callId: dto.callId,
                        leadId: callLog.leadId,
                        status: dto.status,
                        duration: dto.duration,
                        type: 'VOIP_CALL_STATUS',
                    } as any,
                    userId: callLog.userId,
                    leadId: callLog.leadId,
                },
            });

            // Send notification to assigned user
            const lead = await this.prisma.lead.findUnique({
                where: { id: callLog.leadId },
                select: { assignedTo: true },
            });

            if (lead?.assignedTo) {
                try {
                    await this.notificationsService.create({
                        userId: lead.assignedTo,
                        type: NotificationType.COMMUNICATION_LOGGED,
                        title: `VoIP Call ${dto.status.charAt(0).toUpperCase() + dto.status.slice(1)}`,
                        message: `VoIP call with ${callLog.phoneNumber} has been ${dto.status}`,
                        link: `/leads/${callLog.leadId}`,
                        metadata: {
                            callId: dto.callId,
                            leadId: callLog.leadId,
                            status: dto.status,
                            type: 'VOIP_CALL',
                        },
                    });
                } catch (error) {
                    this.logger.error('Failed to send VoIP notification:', error);
                }
            }

            this.logger.log(`VoIP call ${dto.status}: ${dto.callId} for lead: ${callLog.leadId}`);

            return {
                success: true,
                message: 'VoIP webhook processed successfully',
                data: {
                    callId: dto.callId,
                    status: dto.status,
                    leadId: callLog.leadId,
                },
            };
        } catch (error) {
            this.logger.error('Error processing VoIP webhook:', error);
            return {
                success: false,
                message: 'Failed to process VoIP webhook',
                error: error.message,
            };
        }
    }

    // Get VoIP Call History
    async getVoIPCallHistory({
        leadId,
        userId,
        status,
        region,
        page = 1,
        limit = 10,
    }: {
        leadId?: number;
        userId?: number;
        status?: string;
        region?: string;
        page?: number;
        limit?: number;
    }, user?: any) {
        try {
            const where: any = {};
            if (leadId) where.leadId = leadId;
            if (userId) where.userId = userId;
            if (status) where.status = status;
            if (region) where.region = region;

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    if (where.AND) {
                        where.AND.push(roleBasedWhere);
                    } else {
                        where.AND = [roleBasedWhere];
                    }
                }
            }

            const [calls, total] = await Promise.all([
                this.prisma.voIPCall.findMany({
                    where,
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true } },
                        lead: { select: { id: true, firstName: true, lastName: true, company: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                this.prisma.voIPCall.count({ where }),
            ]);

            return {
                success: true,
                data: {
                    calls,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        itemsPerPage: limit,
                    },
                },
            };
        } catch (error) {
            this.logger.error('Error fetching VoIP call history:', error);
            return {
                success: false,
                message: 'Failed to fetch VoIP call history',
                error: error.message,
            };
        }
    }

    // Get VoIP Statistics
    async getVoIPStatistics(user?: any) {
        try {
            const where: any = {};

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    where.AND = [roleBasedWhere];
                }
            }

            const totalCalls = await this.prisma.voIPCall.count({ where });
            const answeredCalls = await this.prisma.voIPCall.count({
                where: { ...where, status: 'answered' },
            });
            const completedCalls = await this.prisma.voIPCall.count({
                where: { ...where, status: 'completed' },
            });
            const videoCalls = await this.prisma.voIPCall.count({
                where: { ...where, callType: 'video' },
            });
            const audioCalls = await this.prisma.voIPCall.count({
                where: { ...where, callType: 'audio' },
            });

            const avgDuration = await this.prisma.voIPCall.aggregate({
                where: { ...where, status: 'completed', duration: { not: null } },
                _avg: { duration: true },
            });

            const indiaCalls = await this.prisma.voIPCall.count({
                where: { ...where, region: 'india' },
            });
            const arabicCalls = await this.prisma.voIPCall.count({
                where: { ...where, region: 'arabic' },
            });

            return {
                success: true,
                data: {
                    totalCalls,
                    answeredCalls,
                    completedCalls,
                    videoCalls,
                    audioCalls,
                    averageCallDuration: avgDuration._avg?.duration || 0,
                    indiaCalls,
                    arabicCalls,
                    answerRate: totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0,
                    completionRate: totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0,
                },
            };
        } catch (error) {
            this.logger.error('Error fetching VoIP statistics:', error);
            return {
                success: false,
                message: 'Failed to fetch VoIP statistics',
                error: error.message,
            };
        }
    }

    // Helper method for call status colors
    private getCallStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'initiated':
                return '#3B82F6'; // Blue
            case 'ringing':
                return '#8B5CF6'; // Purple
            case 'answered':
                return '#10B981'; // Green
            case 'completed':
                return '#059669'; // Dark Green
            case 'failed':
                return '#EF4444'; // Red
            case 'busy':
                return '#F59E0B'; // Amber
            case 'no_answer':
                return '#6B7280'; // Gray
            case 'cancelled':
                return '#9CA3AF'; // Light Gray
            default:
                return '#6B7280'; // Gray
        }
    }

    // Get VoIP Webhook URL
    getVoIPWebhookUrl(baseUrl: string) {
        return {
            success: true,
            data: {
                voipWebhook: `${baseUrl}/communications/voip/webhook`,
                twimlWebhook: `${baseUrl}/communications/voip/twiml`,
                instructions: {
                    voip: 'Configure "voipWebhook" as the Status Callback URL.',
                    twiml: 'Configure "twimlWebhook" as the Voice Request URL in your TwiML App.',
                },
            },
        };
    }
}
