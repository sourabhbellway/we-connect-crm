import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    limit = 10,
    status,
    search,
    leadId,
    dealId,
    contactId,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    leadId?: number;
    dealId?: number;
    contactId?: number;
  }) {
    const where: any = { deletedAt: null };
    if (status) where.status = status.toUpperCase();
    if (leadId) where.leadId = leadId;
    if (dealId) where.dealId = dealId;
    if (contactId) where.contactId = contactId;
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) return { success: false, message: 'Task not found' };
    return { success: true, data: { task } };
  }

  async create(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status as any) ?? 'PENDING',
        priority: (dto.priority as any) ?? 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assignedTo: dto.assignedTo ?? null,
        createdBy: dto.createdBy,
        leadId: dto.leadId ?? null,
        dealId: dto.dealId ?? null,
        contactId: dto.contactId ?? null,
      },
    });
    return { success: true, data: { task } };
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as any,
        priority: dto.priority as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assignedTo: dto.assignedTo ?? undefined,
        leadId: dto.leadId ?? undefined,
        dealId: dto.dealId ?? undefined,
        contactId: dto.contactId ?? undefined,
        updatedAt: new Date(),
      },
    });
    return { success: true, data: { task } };
  }

  async complete(id: number) {
    const task = await this.prisma.task.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    return { success: true, data: { task } };
  }

  async remove(id: number) {
    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true };
  }
}
