import { Module } from '@nestjs/common';
import { CallLogsController } from './call-logs.controller';
import { CallLogsService } from './call-logs.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CallLogsController],
  providers: [CallLogsService, PrismaService],
})
export class CallLogsModule {}
