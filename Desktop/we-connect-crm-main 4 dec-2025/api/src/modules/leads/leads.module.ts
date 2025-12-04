import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../database/prisma.service';
import { AutomationModule } from '../automation/automation.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AutomationModule, NotificationsModule],
  controllers: [LeadsController],
  providers: [LeadsService, PrismaService],
})
export class LeadsModule {}
