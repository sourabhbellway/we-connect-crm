import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    let dbConnected = false;
    let dbError = null;

    try {
      // Check database connection
      await this.prismaService.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (error) {
      dbConnected = false;
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }

    return {
      success: dbConnected,
      message: dbConnected ? 'CRM API is running and database is connected' : 'CRM API is running but database is not connected',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        error: dbError,
      },
    };
  }
}
