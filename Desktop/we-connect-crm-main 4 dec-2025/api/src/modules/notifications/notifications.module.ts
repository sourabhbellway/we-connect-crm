import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationCronService } from './notifications.scheduler';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, NotificationCronService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
