import { PrismaService } from '../../database/prisma.service';
import { CreateLeadImportBatchDto } from './dto/create-lead-import-batch.dto';
export declare class BulkImportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createLeadBatch(dto: CreateLeadImportBatchDto): Promise<{
        success: boolean;
        data: {
            batch: {
                records: {
                    createdAt: Date;
                    id: number;
                    status: import("@prisma/client").$Enums.LeadImportStatus;
                    leadId: number | null;
                    errors: import("@prisma/client/runtime/library").JsonValue | null;
                    rowIndex: number;
                    rawData: import("@prisma/client/runtime/library").JsonValue;
                    batchId: number;
                }[];
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                status: import("@prisma/client").$Enums.LeadImportStatus;
                createdBy: number;
                errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
                fileName: string;
                totalRows: number;
                successRows: number;
                failedRows: number;
            };
        };
    }>;
    listBatches({ page, limit, }: {
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                status: import("@prisma/client").$Enums.LeadImportStatus;
                createdBy: number;
                errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
                fileName: string;
                totalRows: number;
                successRows: number;
                failedRows: number;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    listRecords(batchId: number): Promise<{
        success: boolean;
        data: {
            items: {
                createdAt: Date;
                id: number;
                status: import("@prisma/client").$Enums.LeadImportStatus;
                leadId: number | null;
                errors: import("@prisma/client/runtime/library").JsonValue | null;
                rowIndex: number;
                rawData: import("@prisma/client/runtime/library").JsonValue;
                batchId: number;
            }[];
        };
    }>;
}
