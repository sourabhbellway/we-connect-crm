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
                    leadId: number | null;
                    id: number;
                    createdAt: Date;
                    status: import(".prisma/client").$Enums.LeadImportStatus;
                    errors: import("@prisma/client/runtime/library").JsonValue | null;
                    rowIndex: number;
                    rawData: import("@prisma/client/runtime/library").JsonValue;
                    batchId: number;
                }[];
            } & {
                createdBy: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.LeadImportStatus;
                errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
                fileName: string;
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
                createdBy: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.LeadImportStatus;
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
    listRecords(id: string): Promise<{
        success: boolean;
        data: {
            items: {
                leadId: number | null;
                id: number;
                createdAt: Date;
                status: import(".prisma/client").$Enums.LeadImportStatus;
                errors: import("@prisma/client/runtime/library").JsonValue | null;
                rowIndex: number;
                rawData: import("@prisma/client/runtime/library").JsonValue;
                batchId: number;
            }[];
        };
    }>;
}
