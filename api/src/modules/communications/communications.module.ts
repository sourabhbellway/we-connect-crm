import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { WebhooksController } from './webhooks.controller';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CommunicationsController, WebhooksController],
  providers: [CommunicationsService, PrismaService],
})
export class CommunicationsModule {}
