import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';

@Injectable()
export class CallLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ leadId, userId }: { leadId?: number; userId?: number }) {
    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (userId) where.userId = userId;
    const items = await this.prisma.callLog.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { success: true, data: { items } };
  }

  async getById(id: number) {
    const item = await this.prisma.callLog.findUnique({ where: { id } });
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