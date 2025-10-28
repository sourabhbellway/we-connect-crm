import { BulkImportService } from './bulk-import.service';
import { CreateLeadImportBatchDto } from './dto/create-lead-import-batch.dto';
export declare class BulkImportController {
    private readonly service;
    constructor(service: BulkImportService);
    createBatch(dto: CreateLeadImportBatchDto): Promise<{
        success: boolean;
        data: {
            batch: {
                records: {
                    id: number;
                    createdAt: Date;
                    status: import("@prisma/client").$Enums.LeadImportStatus;
                    leadId: number | null;
                    rowIndex: number;
                    errors: import("@prisma/client/runtime/library").JsonValue | null;
                    rawData: import("@prisma/client/runtime/library").JsonValue;
                    batchId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.LeadImportStatus;
                createdBy: number;
                fileName: string;
                errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
                totalRows: number;
                successRows: number;
                failedRows: number;
            };
        };
    }>;
    listBatches(page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.LeadImportStatus;
                createdBy: number;
                fileName: string;
                errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
                totalRows: number;
                successRows: number;
                failedRows: number;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    listRecords(id: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                status: import("@prisma/client").$Enums.LeadImportStatus;
                leadId: number | null;
                rowIndex: number;
                errors: import("@prisma/client/runtime/library").JsonValue | null;
                rawData: import("@prisma/client/runtime/library").JsonValue;
                batchId: number;
            }[];
        };
    }>;
}
