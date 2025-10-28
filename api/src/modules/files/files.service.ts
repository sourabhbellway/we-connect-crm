import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ entityType, entityId }: { entityType?: string; entityId?: number }) {
    const where: any = { deletedAt: null };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    const items = await this.prisma.file.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { success: true, data: { items } };
  }

  async upload({ file, entityType, entityId, uploadedBy, name }: { file: any; entityType: string; entityId: number; uploadedBy: number; name?: string }) {
    const saved = await this.prisma.file.create({
      data: {
        name: name || file?.originalname || 'file',
        fileName: file?.originalname || 'file.bin',
        filePath: `/uploads/${file?.filename || file?.originalname || 'file.bin'}`,
        fileSize: file?.size || 0,
        mimeType: file?.mimetype || 'application/octet-stream',
        entityType,
        entityId,
        uploadedBy,
      },
    });
    return { success: true, data: { file: saved } };
  }

  async remove(id: number) {
    await this.prisma.file.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }
}