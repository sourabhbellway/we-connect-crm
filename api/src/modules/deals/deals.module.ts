import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AutomationModule } from '../automation/automation.module';

@Module({
  imports: [NotificationsModule, AutomationModule],
  controllers: [DealsController],
  providers: [DealsService, PrismaService],
})
export class DealsModule { }
