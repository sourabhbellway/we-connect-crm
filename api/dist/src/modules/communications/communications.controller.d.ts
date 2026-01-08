import { CommunicationsService } from './communications.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';
import { ListMessagesQuery } from './dto/list-messages.query';
import { InitiateVoIPCallDto } from './dto/initiate-voip-call.dto';
import { VoIPWebhookDto } from './dto/voip-webhook.dto';
import { VoIPConfigDto } from './dto/voip-config.dto';
export declare class CommunicationsController {
    private readonly service;
    constructor(service: CommunicationsService);
    listMeetings(leadId: string, user?: any): Promise<{
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
    listLeadComms(leadId: string, user?: any): Promise<{
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
    listTemplates(type?: string, active?: string, page?: string, limit?: string, user?: any): Promise<{
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
    updateTemplate(id: string, dto: UpsertTemplateDto): Promise<{
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
    getVoIPConfig(user?: any): Promise<{
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
    saveVoIPConfig(dto: VoIPConfigDto, user?: any): Promise<{
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
    initiateVoIPCall(dto: InitiateVoIPCallDto, user?: any): Promise<{
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
    getVoIPCallHistory(leadId?: string, userId?: string, status?: string, region?: string, page?: string, limit?: string, user?: any): Promise<{
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
