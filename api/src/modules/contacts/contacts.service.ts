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
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

    const where: any = { deletedAt: null };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { position: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / pageSize));
    return {
      success: true,
      data: {
        contacts: rows,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          pages,
        },
      },
    };
  }

  async getById(id: number) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, deletedAt: null },
      include: {
        companyRelation: true,
        deals: true,
        tasks: true,
        quotations: true,
        invoices: { include: { payments: true } },
        followUps: true,
      },
    });
    if (!contact) return { success: false, message: 'Contact not found' };

    // Fetch communications and activities related to this contact
    const [communications, activities, relatedContacts] = await Promise.all([
      this.prisma.contactCommunication.findMany({ where: { contactId: id }, orderBy: { createdAt: 'desc' } }).catch(() => []),
      this.prisma.contactActivity.findMany({ where: { contactId: id }, orderBy: { createdAt: 'desc' } }).catch(() => []),
      contact.companyId
        ? this.prisma.contact.findMany({ where: { companyId: contact.companyId, id: { not: id }, deletedAt: null }, orderBy: { firstName: 'asc' } })
        : Promise.resolve([]),
    ]);

    return {
      success: true,
      data: {
        contact,
        company: contact.companyRelation,
        deals: contact.deals,
        tasks: contact.tasks,
        quotations: contact.quotations,
        invoices: contact.invoices,
        followUps: contact.followUps,
        communications,
        activities,
        relatedContacts,
      },
    };
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
