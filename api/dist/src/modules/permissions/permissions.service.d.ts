import { PrismaService } from '../../database/prisma.service';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
            key: string;
            module: string;
        }[];
    }>;
}
