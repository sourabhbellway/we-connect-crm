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
    listLeadComms(leadId: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                leadId: number;
                completedAt: Date | null;
                type: import("@prisma/client").$Enums.CommunicationType;
                subject: string | null;
                scheduledAt: Date | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
            }[];
        };
    }>;
    listTemplates(type?: string, active?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            templates: ({
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                createdBy: number;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                isDefault: boolean;
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
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                createdBy: number;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                isDefault: boolean;
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
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                createdBy: number;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                isDefault: boolean;
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
    listMessages(q: ListMessagesQuery): Promise<{
        success: boolean;
        data: {
            messages: ({
                user: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    phone: string | null;
                };
                template: {
                    name: string;
                    id: number;
                    type: import("@prisma/client").$Enums.TemplateType;
                } | null;
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                status: import("@prisma/client").$Enums.MessageStatus;
                leadId: number;
                sentAt: Date | null;
                type: import("@prisma/client").$Enums.TemplateType;
                subject: string | null;
                content: string;
                deliveredAt: Date | null;
                readAt: Date | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                templateId: number | null;
                recipient: string;
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                leadId: number;
                completedAt: Date | null;
                type: import("@prisma/client").$Enums.CommunicationType;
                subject: string | null;
                scheduledAt: Date | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
            };
        };
    }>;
}
