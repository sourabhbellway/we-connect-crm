import { PrismaService } from '../../database/prisma.service';
export declare class LeadsDebugService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateLeadData(data: any): Promise<{
        success: boolean;
        message: string;
        errors: Record<string, string>;
        validationDetails: any[];
        fieldConfigCount: number;
    }>;
}
