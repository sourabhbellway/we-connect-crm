import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) { }

  async list({
    entityType,
    entityId,
  }: {
    entityType?: string;
    entityId?: number;
  }, user?: any) {
    const where: any = { deletedAt: null };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['uploadedBy']);
      if (Object.keys(roleBasedWhere).length > 0) {
        if (where.AND) {
          where.AND.push(roleBasedWhere);
        } else {
          where.AND = [roleBasedWhere];
        }
      }
    }

    const files = await this.prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    // Provide both keys for client compatibility
    return { success: true, data: { files, items: files } };
  }

  async getById(id: number, user?: any) {
    const where: any = { id, deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['uploadedBy']);
      if (Object.keys(roleBasedWhere).length > 0) {
        where.AND = [roleBasedWhere];
      }
    }

    return this.prisma.file.findFirst({ where });
  }

  async upload({
    file,
    entityType,
    entityId,
    uploadedBy,
    name,
  }: {
    file: any;
    entityType: string;
    entityId: number;
    uploadedBy: number;
    name?: string;
  }) {
    const saved = await this.prisma.file.create({
      data: {
        name: name || file?.originalname || 'file',
        fileName: file?.filename || file?.originalname || 'file.bin',
        filePath: `/uploads/${file?.filename || file?.originalname || 'file.bin'}`,
        fileSize: file?.size || 0,
        mimeType: file?.mimetype || 'application/octet-stream',
        entityType,
        entityId,
        uploadedBy,
      },
    });

    // Create activity for file upload
    if (entityType === 'lead' && entityId) {
      try {
        await this.prisma.activity.create({
          data: {
            title: 'File uploaded',
            description: `File "${saved.name}" uploaded (${(saved.fileSize / 1024).toFixed(2)} KB)`,
            type: 'COMMUNICATION_LOGGED' as any, // Using existing type, will update enum later
            icon: 'FileText',
            iconColor: '#3B82F6',
            metadata: {
              fileId: saved.id,
              fileName: saved.name,
              fileSize: saved.fileSize,
              mimeType: saved.mimeType,
            } as any,
            userId: uploadedBy,
            leadId: entityId,
          },
        });
      } catch (error) {
        console.error('Error creating file upload activity:', error);
        // Don't fail the upload if activity creation fails
      }
    }

    return { success: true, data: { file: saved } };
  }

  async remove(id: number) {
    const file = await this.prisma.file.findFirst({ where: { id } });
    if (!file) return { success: false, message: 'File not found' };

    await this.prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create activity for file deletion
    if (file.entityType === 'lead' && file.entityId) {
      try {
        await this.prisma.activity.create({
          data: {
            title: 'File deleted',
            description: `File "${file.name}" deleted`,
            type: 'COMMUNICATION_LOGGED' as any,
            icon: 'Trash2',
            iconColor: '#EF4444',
            metadata: {
              fileId: file.id,
              fileName: file.name,
            } as any,
            userId: file.uploadedBy,
            leadId: file.entityId,
          },
        });
      } catch (error) {
        console.error('Error creating file delete activity:', error);
      }
    }

    return { success: true };
  }
}
