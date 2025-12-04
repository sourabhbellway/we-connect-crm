import { Module } from '@nestjs/common';
import { LeadSourcesService } from './lead-sources.service';
import { LeadSourcesController } from './lead-sources.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [LeadSourcesController],
  providers: [LeadSourcesService, PrismaService],
})
export class LeadSourcesModule {}
