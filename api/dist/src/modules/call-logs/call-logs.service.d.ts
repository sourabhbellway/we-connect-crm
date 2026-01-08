import { PrismaService } from '../../database/prisma.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CallLogsService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    list({ leadId, userId, page, limit }: {
        leadId?: number;
        userId?: number;
        page?: number;
        limit?: number;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
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
                notes: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                recordingUrl: string | null;
                startTime: Date | null;
                endTime: Date | null;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                isAnswered: boolean;
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
        message: any;
        error: any;
        data?: undefined;
    }>;
    getById(id: number, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: {
            item: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                recordingUrl: string | null;
                startTime: Date | null;
                endTime: Date | null;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                isAnswered: boolean;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    create(dto: CreateCallLogDto): Promise<{
        success: boolean;
        data: {
            item: {
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
                notes: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                recordingUrl: string | null;
                startTime: Date | null;
                endTime: Date | null;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                isAnswered: boolean;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: number, dto: UpdateCallLogDto): Promise<{
        success: boolean;
        data: {
            item: {
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
                notes: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                recordingUrl: string | null;
                startTime: Date | null;
                endTime: Date | null;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                isAnswered: boolean;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
    }>;
    getByLeadId(leadId: number, user?: any): Promise<{
        success: boolean;
        data: {
            callLogs: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                recordingUrl: string | null;
                startTime: Date | null;
                endTime: Date | null;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                isAnswered: boolean;
            }[];
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getByUserId(userId: number, user?: any): Promise<{
        success: boolean;
        data: {
            callLogs: ({
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
                notes: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                recordingUrl: string | null;
                startTime: Date | null;
                endTime: Date | null;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                isAnswered: boolean;
            })[];
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getStatistics(user?: any): Promise<{
        success: boolean;
        data: {
            totalCalls: number;
            answeredCalls: number;
            completedCalls: number;
            averageCallDuration: number;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    updateStatus(id: number, status: string, user?: any): Promise<{
        success: boolean;
        data: {
            item: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                recordingUrl: string | null;
                startTime: Date | null;
                endTime: Date | null;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                isAnswered: boolean;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
}
