import { PrismaService } from '../../database/prisma.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
export declare class CallLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ leadId, userId }: {
        leadId?: number;
        userId?: number;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                user: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                lead: {
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                    company: string | null;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                userId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                isAnswered: boolean;
                recordingUrl: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                userId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                isAnswered: boolean;
                recordingUrl: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                userId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                isAnswered: boolean;
                recordingUrl: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                userId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                isAnswered: boolean;
                recordingUrl: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                userId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                isAnswered: boolean;
                recordingUrl: string | null;
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
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                lead: {
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                    company: string | null;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                userId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                isAnswered: boolean;
                recordingUrl: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                id: number;
                userId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                leadId: number;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                isAnswered: boolean;
                recordingUrl: string | null;
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
