import { PrismaClient } from '@prisma/client';
interface ImportResult {
    batchId: number;
    totalRows: number;
    successRows: number;
    failedRows: number;
    errors: Array<{
        row: number;
        errors: string[];
        data: any;
    }>;
}
export declare class BulkImportService {
    private prisma;
    constructor(prisma: PrismaClient);
    private validateLeadData;
    private sanitizeLeadData;
    processCSVFile(filePath: string, fileName: string, createdBy: number): Promise<ImportResult>;
    generateCSVTemplate(): Promise<string>;
    exportLeadsToCSV(filters?: {
        status?: string;
        assignedTo?: number;
        createdAfter?: Date;
        createdBefore?: Date;
    }): Promise<string>;
    getImportBatches(userId?: number, limit?: number): Promise<any[]>;
    getImportBatchDetails(batchId: number): Promise<any>;
}
export {};
//# sourceMappingURL=BulkImportService.d.ts.map