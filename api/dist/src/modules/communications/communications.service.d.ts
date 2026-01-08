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
                    id: number;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
    listMeetings(leadId: number, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                user: {
                    id: number;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
    createLeadComm(dto: CreateLeadCommunicationDto): Promise<{
        success: boolean;
        data: {
            communication: {
                user: {
                    id: number;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
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
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
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
    updateTemplate(id: number, dto: UpsertTemplateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            template: {
                createdByUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
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
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    phone: string | null;
                };
                template: {
                    id: number;
                    name: string;
                    type: import("@prisma/client").$Enums.TemplateType;
                } | null;
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.TemplateType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                status: import("@prisma/client").$Enums.MessageStatus;
                subject: string | null;
                content: string;
                templateId: number | null;
                errorMessage: string | null;
                readAt: Date | null;
                recipient: string;
                sentAt: Date | null;
                deliveredAt: Date | null;
                failedAt: Date | null;
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
    getVoIPConfig(): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: {
            config: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                provider: string;
                apiKey: string;
                apiSecret: string;
                accountSid: string | null;
                authToken: string | null;
                regions: string[];
                defaultRegion: string | null;
                enableCallRecording: boolean;
                recordingStorage: string | null;
                enableVideoCalls: boolean;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    saveVoIPConfig(dto: VoIPConfigDto): Promise<{
        success: boolean;
        message: string;
        data: {
            config: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                provider: string;
                apiKey: string;
                apiSecret: string;
                accountSid: string | null;
                authToken: string | null;
                regions: string[];
                defaultRegion: string | null;
                enableCallRecording: boolean;
                recordingStorage: string | null;
                enableVideoCalls: boolean;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    initiateVoIPCall(dto: InitiateVoIPCallDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            callId: string;
            callLogId: number;
            provider: string;
            token: any;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    generateTwiML(body: any): Promise<any>;
    handleVoIPWebhook(dto: VoIPWebhookDto): Promise<{
        success: boolean;
        message: string;
        data: {
            callId: string;
            status?: undefined;
            leadId?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            callId: string;
            status: "initiated" | "ringing" | "answered" | "completed" | "failed" | "busy" | "no_answer" | "cancelled";
            leadId: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getVoIPCallHistory({ leadId, userId, status, region, page, limit, }: {
        leadId?: number;
        userId?: number;
        status?: string;
        region?: string;
        page?: number;
        limit?: number;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            calls: ({
                user: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                lead: {
                    id: number;
                    firstName: string | null;
                    lastName: string | null;
                    company: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                status: string;
                duration: number | null;
                phoneNumber: string;
                callType: string;
                region: string | null;
                callId: string;
                recordingUrl: string | null;
                errorMessage: string | null;
                errorCode: string | null;
                isRecorded: boolean;
                provider: string;
                startTime: Date | null;
                endTime: Date | null;
            })[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
                itemsPerPage: number;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getVoIPStatistics(user?: any): Promise<{
        success: boolean;
        data: {
            totalCalls: number;
            answeredCalls: number;
            completedCalls: number;
            videoCalls: number;
            audioCalls: number;
            averageCallDuration: number;
            indiaCalls: number;
            arabicCalls: number;
            answerRate: number;
            completionRate: number;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    private getCallStatusColor;
    getVoIPWebhookUrl(baseUrl: string): {
        success: boolean;
        data: {
            voipWebhook: string;
            twimlWebhook: string;
            instructions: {
                voip: string;
                twiml: string;
            };
        };
    };
}
