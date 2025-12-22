import { CallLogsService } from './call-logs.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
export declare class CallLogsController {
    private readonly service;
    constructor(service: CallLogsService);
    list(leadId?: string, userId?: string, user?: any): Promise<{
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
                recordingUrl: string | null;
                isAnswered: boolean;
            })[];
        };
    }>;
    listByLead(leadId: string, user?: any): Promise<{
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
                recordingUrl: string | null;
                isAnswered: boolean;
            })[];
        };
    }>;
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            item: {
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
                recordingUrl: string | null;
                isAnswered: boolean;
            };
        };
        message?: undefined;
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
                recordingUrl: string | null;
                isAnswered: boolean;
            };
        };
    }>;
    update(id: string, dto: UpdateCallLogDto): Promise<{
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
                recordingUrl: string | null;
                isAnswered: boolean;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
