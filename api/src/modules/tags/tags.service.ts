import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  // Predefined palette
  private predefinedColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1',
    '#64748B', '#374151', '#7C2D12', '#B91C1C', '#365314'
  ];

  // Generate a unique color
  private async generateUniqueColor(): Promise<string> {
    const existing = await this.prisma.tag.findMany({
      select: { color: true }
    });

    const used = existing.map((x) => x.color);
    const available = this.predefinedColors.filter((c) => !used.includes(c));

    // If palette is not exhausted → pick from available
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }

    // If palette exhausted → generate random unique hex
    let color = '';
    do {
      color = '#' + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    } while (used.includes(color));

    return color;
  }

  async list() {
    const items = await this.prisma.tag.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: items };
  }

  async create(dto: UpsertTagDto) {
    const finalColor = dto.color || await this.generateUniqueColor();

    // Validate if user passed a duplicate color manually
    const exists = await this.prisma.tag.findFirst({
      where: { color: finalColor }
    });

    if (exists) {
      throw new BadRequestException('Color must be unique.');
    }

    const tag = await this.prisma.tag.create({
      data: {
        name: dto.name,
        color: finalColor,
        description: dto.description ?? null,
        isActive: dto.isActive ?? true,
      },
    });

    return { success: true, data: tag };
  }

  async update(id: number, dto: UpsertTagDto) {
    // If user tries to update color → ensure new color is unique
    if (dto.color) {
      const exists = await this.prisma.tag.findFirst({
        where: { color: dto.color, NOT: { id } }
      });

      if (exists) {
        throw new BadRequestException('Color must be unique.');
      }
    }

    // Prepare update object
    const updateData: any = {
      name: dto.name,
    };

    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.description !== undefined) updateData.description = dto.description ?? null;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const tag = await this.prisma.tag.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: tag };
  }

  async remove(id: number) {
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }
}
