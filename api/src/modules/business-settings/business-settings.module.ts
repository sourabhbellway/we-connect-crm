import { Module } from '@nestjs/common';
import { BusinessSettingsService } from './business-settings.service';
import { BusinessSettingsController } from './business-settings.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [BusinessSettingsController],
  providers: [BusinessSettingsService, PrismaService],
})
export class BusinessSettingsModule {}
