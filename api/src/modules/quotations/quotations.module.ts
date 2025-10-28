import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [QuotationsController],
  providers: [QuotationsService, PrismaService],
})
export class QuotationsModule {}
