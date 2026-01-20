import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prismaService;
    constructor(appService: AppService, prismaService: PrismaService);
    getHello(): string;
    health(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        database: {
            connected: boolean;
            error: string | null;
        };
    }>;
}
