import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';

@Injectable()
export class CallLogsService {
  constructor(private readonly prisma: PrismaService) { }

  async list({ leadId, userId }: { leadId?: number; userId?: number }, user?: any) {
    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (userId) where.userId = userId;

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
      if (Object.keys(roleBasedWhere).length > 0) {
        if (where.OR || where.AND) {
          where.AND = [
            ...(where.AND || []),
            roleBasedWhere
          ];
        } else {
          where.AND = [roleBasedWhere];
        }
      }
    }

    const items = await this.prisma.callLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        lead: { select: { id: true, firstName: true, lastName: true, company: true } },
      }
    });
    return { success: true, data: { items } };
  }

  async getById(id: number, user?: any) {
    const where: any = { id };

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
      if (Object.keys(roleBasedWhere).length > 0) {
        where.AND = [roleBasedWhere];
      }
    }

    const item = await this.prisma.callLog.findFirst({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        lead: { select: { id: true, firstName: true, lastName: true, company: true } },
      }
    });
    if (!item) return { success: false, message: 'Call log not found' };
    return { success: true, data: { item } };
  }

  async create(dto: CreateCallLogDto) {
    const item = await this.prisma.callLog.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId,
        phoneNumber: dto.phoneNumber,
        callType: (dto.callType as any) ?? 'OUTBOUND',
        callStatus: (dto.callStatus as any) ?? 'INITIATED',
        duration: dto.duration ?? null,
        startTime: dto.startTime ? new Date(dto.startTime) : null,
        endTime: dto.endTime ? new Date(dto.endTime) : null,
        notes: dto.notes ?? null,
        outcome: dto.outcome ?? null,
        recordingUrl: dto.recordingUrl ?? null,
        isAnswered: dto.isAnswered ?? false,
        metadata: (dto.metadata as any) ?? undefined,
      },
    });
    return { success: true, data: { item } };
  }

  async update(id: number, dto: UpdateCallLogDto) {
    const item = await this.prisma.callLog.update({
      where: { id },
      data: {
        phoneNumber: dto.phoneNumber,
        callType: dto.callType as any,
        callStatus: dto.callStatus as any,
        duration: dto.duration,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        notes: dto.notes,
        outcome: dto.outcome,
        recordingUrl: dto.recordingUrl,
        isAnswered: dto.isAnswered,
        metadata: dto.metadata as any,
        updatedAt: new Date(),
      },
    });
    return { success: true, data: { item } };
  }

  async remove(id: number) {
    await this.prisma.callLog.delete({ where: { id } });
    return { success: true };
  }
}
