import { CommunicationsService } from './communications.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';
import { ListMessagesQuery } from './dto/list-messages.query';
export declare class CommunicationsController {
    private readonly service;
    constructor(service: CommunicationsService);
    listMeetings(leadId: string, user?: any): Promise<{
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
                type: import("@prisma/client").$Enums.CommunicationType;
                userId: number;
                leadId: number;
                subject: string | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
                scheduledAt: Date | null;
                completedAt: Date | null;
            })[];
        };
    }>;
    listLeadComms(leadId: string, user?: any): Promise<{
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
                type: import("@prisma/client").$Enums.CommunicationType;
                userId: number;
                leadId: number;
                subject: string | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
                scheduledAt: Date | null;
                completedAt: Date | null;
            })[];
        };
    }>;
    listTemplates(type?: string, active?: string, page?: string, limit?: string, user?: any): Promise<{
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
                createdBy: number;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
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
                createdBy: number;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
            };
        };
    }>;
    updateTemplate(id: string, dto: UpsertTemplateDto): Promise<{
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
                createdBy: number;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
            };
        };
    }>;
    deleteTemplate(id: string): Promise<{
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
    sendMeetingEmail(body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    listMessages(q: ListMessagesQuery, user?: any): Promise<{
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
                type: import("@prisma/client").$Enums.TemplateType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                status: import("@prisma/client").$Enums.MessageStatus;
                subject: string | null;
                content: string;
                readAt: Date | null;
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
                type: import("@prisma/client").$Enums.CommunicationType;
                userId: number;
                leadId: number;
                subject: string | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
                scheduledAt: Date | null;
                completedAt: Date | null;
            };
        };
    }>;
}
