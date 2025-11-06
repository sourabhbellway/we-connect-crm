import { PrismaService } from '../../database/prisma.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
export declare class CallLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ leadId, userId }: {
        leadId?: number;
        userId?: number;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                userId: number;
                leadId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                duration: number | null;
                outcome: string | null;
                phoneNumber: string;
                callType: import("@prisma/client").$Enums.CallType;
                callStatus: import("@prisma/client").$Enums.CallStatus;
                startTime: Date | null;
                endTime: Date | null;
                recordingUrl: string | null;
                isAnswered: boolean;
            }[];
        };
    }>;
    getById(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            item: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                userId: number;
                leadId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                userId: number;
                leadId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    update(id: number, dto: UpdateCallLogDto): Promise<{
        success: boolean;
        data: {
            item: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                userId: number;
                leadId: number;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
