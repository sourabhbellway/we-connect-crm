import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { WebhooksController } from './webhooks.controller';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommunicationProvidersController } from './communication-providers.controller';
import { CommunicationProvidersService } from './communication-providers.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CommunicationsController, WebhooksController, CommunicationProvidersController],
  providers: [CommunicationsService, CommunicationProvidersService, PrismaService],
})
export class CommunicationsModule {}
