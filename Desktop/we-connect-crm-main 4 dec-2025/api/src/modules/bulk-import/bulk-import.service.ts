import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadImportBatchDto } from './dto/create-lead-import-batch.dto';

@Injectable()
export class BulkImportService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeadBatch(dto: CreateLeadImportBatchDto) {
    const batch = await this.prisma.leadImportBatch.create({
      data: {
        fileName: dto.fileName || `leads-${Date.now()}.json`,
        totalRows: dto.records.length,
        createdBy: dto.createdBy,
        records: {
          create: dto.records.map((raw, idx) => ({
            rowIndex: idx,
            rawData: raw,
          })) as any,
        },
      },
      include: { records: true },
    });
    return { success: true, data: { batch } };
  }

  async listBatches({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.leadImportBatch.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leadImportBatch.count(),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async listRecords(batchId: number) {
    const items = await this.prisma.leadImportRecord.findMany({
      where: { batchId },
      orderBy: { rowIndex: 'asc' },
    });
    return { success: true, data: { items } };
  }
}
