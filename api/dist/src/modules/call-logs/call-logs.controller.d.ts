import { CallLogsService } from './call-logs.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
export declare class CallLogsController {
    private readonly service;
    constructor(service: CallLogsService);
    list(leadId?: string, userId?: string, page?: string, limit?: string, user?: any): Promise<{
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
    listByLead(leadId: string, user?: any): Promise<{
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
    get(id: string, user?: any): Promise<{
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
    update(id: string, dto: UpdateCallLogDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
    }>;
    initiate(dto: CreateCallLogDto, fcm?: string): Promise<{
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
}
