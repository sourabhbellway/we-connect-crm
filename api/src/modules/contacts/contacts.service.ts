import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const where: any = { deletedAt: null };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, deletedAt: null },
    });
    if (!contact) return { success: false, message: 'Contact not found' };
    return { success: true, data: { contact } };
  }

  async create(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        position: dto.position,
        notes: dto.notes,
        assignedTo: dto.assignedTo ?? null,
        companyId: dto.companyId ?? null,
      },
    });
    return {
      success: true,
      message: 'Contact created successfully',
      data: { contact },
    };
  }

  async update(id: number, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        position: dto.position,
        notes: dto.notes,
        assignedTo: dto.assignedTo ?? undefined,
        companyId: dto.companyId ?? undefined,
        updatedAt: new Date(),
      },
    });
    return {
      success: true,
      message: 'Contact updated successfully',
      data: { contact },
    };
  }

  async remove(id: number) {
    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true, message: 'Contact deleted successfully' };
  }
}
