import { PrismaService } from '../../database/prisma.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';
export declare class CommunicationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listLeadComms(leadId: number): Promise<{
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                leadId: number;
                type: import("@prisma/client").$Enums.CommunicationType;
                completedAt: Date | null;
                subject: string | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
                scheduledAt: Date | null;
            })[];
        };
    }>;
    listMeetings(leadId: number): Promise<{
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                leadId: number;
                type: import("@prisma/client").$Enums.CommunicationType;
                completedAt: Date | null;
                subject: string | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
                scheduledAt: Date | null;
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
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                leadId: number;
                type: import("@prisma/client").$Enums.CommunicationType;
                completedAt: Date | null;
                subject: string | null;
                content: string;
                direction: string;
                duration: number | null;
                outcome: string | null;
                scheduledAt: Date | null;
            };
        };
    }>;
    listTemplates({ type, active, page, limit, }: {
        type?: string;
        active?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
                type: import("@prisma/client").$Enums.TemplateType;
                createdBy: number;
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
                type: import("@prisma/client").$Enums.TemplateType;
                createdBy: number;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                isDefault: boolean;
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
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                type: import("@prisma/client").$Enums.TemplateType;
                createdBy: number;
                subject: string | null;
                content: string;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                isDefault: boolean;
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
    }): Promise<{
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
                type: import("@prisma/client").$Enums.TemplateType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                sentAt: Date | null;
                subject: string | null;
                content: string;
                templateId: number | null;
                recipient: string;
                deliveredAt: Date | null;
                readAt: Date | null;
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
}
