import { Module } from '@nestjs/common';
import { WebhooksManagementService } from './webhooks-management.service';
import { WebhooksManagementController } from './webhooks-management.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [WebhooksManagementController],
    providers: [WebhooksManagementService, PrismaService],
    exports: [WebhooksManagementService],
})
export class WebhooksManagementModule { }
