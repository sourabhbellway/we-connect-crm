import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';

@Injectable()
export class LeadSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  // ⭐ ADDED: method to generate random HEX color
  private generateUniqueColor() {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

  async list() {
    const items = await this.prisma.leadSource.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return { success: true, data: items };
  }

  async create(dto: UpsertLeadSourceDto) {
    // ⭐ SAME CODE BUT FIXED TO ensure `color` is NEVER undefined

    const maxOrder = await this.prisma.leadSource.aggregate({
      _max: { sortOrder: true },
    });
    const nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    // ⭐ FIX: backend MUST generate a unique color if none provided
    let color = dto.color;
    if (!color) {
      let isUnique = false;
      while (!isUnique) {
        color = this.generateUniqueColor();    // ⭐ ADDED
        const exists = await this.prisma.leadSource.findUnique({
          where: { color },
        });
        if (!exists) isUnique = true;
      }
    }

    // ⭐ FIX: color is ALWAYS a STRING now → solves TS error
    const ls = await this.prisma.leadSource.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        color: color!, // 👈 always a valid string now
        sortOrder: dto.sortOrder ?? nextOrder,
        isActive: dto.isActive ?? true,
      },
    });

    return { success: true, data: ls };
  }

  async update(id: number, dto: UpsertLeadSourceDto) {
    const data: any = {
      name: dto.name,
      description: dto.description ?? null,
    };

    // ⭐ FIX: only update color if user actually provides it
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    try {
      const ls = await this.prisma.leadSource.update({
        where: { id },
        data,
      });

      return { success: true, data: ls };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        throw new BadRequestException(`${field} must be unique`);
        if (field === 'color') {
          return { success: false, message: 'Color must be unique. This color is already used.' };
        }
        if (field === 'name') {
          return { success: false, message: 'Name must be unique. This name already exists.' };
        }
      }

      throw error;
    }
  }

  async remove(id: number) {
    await this.prisma.leadSource.delete({ where: { id } });
    return { success: true };
  }
}
