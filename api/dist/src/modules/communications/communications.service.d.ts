import { PrismaService } from '../../database/prisma.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';
import { EmailWebhookDto } from './dto/email-webhook.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CommunicationsService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    listLeadComms(leadId: number, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                userId: number;
                type: import("@prisma/client").$Enums.CommunicationType;
                subject: string | null;
                content: string;
                leadId: number;
                completedAt: Date | null;
                duration: number | null;
                scheduledAt: Date | null;
                direction: string;
                outcome: string | null;
            })[];
        };
    }>;
    listMeetings(leadId: number, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                userId: number;
                type: import("@prisma/client").$Enums.CommunicationType;
                subject: string | null;
                content: string;
                leadId: number;
                completedAt: Date | null;
                duration: number | null;
                scheduledAt: Date | null;
                direction: string;
                outcome: string | null;
            })[];
        };
    }>;
    createLeadComm(dto: CreateLeadCommunicationDto): Promise<{
        success: boolean;
        data: {
            communication: {
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                userId: number;
                type: import("@prisma/client").$Enums.CommunicationType;
                subject: string | null;
                content: string;
                leadId: number;
                completedAt: Date | null;
                duration: number | null;
                scheduledAt: Date | null;
                direction: string;
                outcome: string | null;
            };
        };
    }>;
    listTemplates({ type, active, page, limit, }: {
        type?: string;
        active?: string;
        page?: number;
        limit?: number;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            templates: ({
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                companyId: number | null;
                name: string;
                isDefault: boolean;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                createdBy: number;
                content: string;
            })[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
                itemsPerPage: number;
            };
        };
    }>;
    createTemplate(dto: UpsertTemplateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            template: {
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                companyId: number | null;
                name: string;
                isDefault: boolean;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                createdBy: number;
                content: string;
            };
        };
    }>;
    updateTemplate(id: number, dto: UpsertTemplateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            template: {
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                companyId: number | null;
                name: string;
                isDefault: boolean;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                createdBy: number;
                content: string;
            };
        };
    }>;
    deleteTemplate(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    sendEmail(dto: SendEmailDto): Promise<{
        success: boolean;
        message: string;
        data: {
            messageId: number;
        };
    }>;
    sendWhatsApp(dto: SendWhatsAppDto): Promise<{
        success: boolean;
        message: string;
        data: {
            messageId: number;
        };
    }>;
    private applyVariables;
    sendTemplated(dto: SendTemplatedDto): Promise<{
        success: boolean;
        message: string;
        data: {
            messageId: number;
        };
    } | {
        success: boolean;
        message: string;
    }>;
    listMessages({ leadId, type, status, page, limit, }: {
        leadId?: number;
        type?: string;
        status?: string;
        page?: number;
        limit?: number;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            messages: ({
                user: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                    phone: string | null;
                };
                template: {
                    id: number;
                    name: string;
                    type: import("@prisma/client").$Enums.TemplateType;
                } | null;
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                userId: number;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: import("@prisma/client").$Enums.MessageStatus;
                content: string;
                readAt: Date | null;
                leadId: number;
                sentAt: Date | null;
                templateId: number | null;
                recipient: string;
                deliveredAt: Date | null;
                failedAt: Date | null;
                errorMessage: string | null;
                externalId: string | null;
            })[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
                itemsPerPage: number;
            };
        };
    }>;
    handleWhatsAppWebhook(dto: WhatsAppWebhookDto): Promise<{
        success: boolean;
        message: string;
        data: {
            phone: string;
            messageId?: undefined;
            leadId?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            messageId: number;
            leadId: number;
            phone?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    handleEmailWebhook(dto: EmailWebhookDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            messageId?: undefined;
            leadId?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            messageId: number;
            leadId: number;
            email?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getWebhookUrls(baseUrl: string): {
        success: boolean;
        data: {
            whatsapp: string;
            email: string;
            instructions: {
                whatsapp: string;
                email: string;
            };
        };
    };
    sendMeetingEmail(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
}
