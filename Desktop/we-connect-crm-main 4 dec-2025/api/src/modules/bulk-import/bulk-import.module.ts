import { Module } from '@nestjs/common';
import { BulkImportController } from './bulk-import.controller';
import { BulkImportService } from './bulk-import.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [BulkImportController],
  providers: [BulkImportService, PrismaService],
})
export class BulkImportModule {}
