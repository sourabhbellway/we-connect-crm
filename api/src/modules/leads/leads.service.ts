import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { TransferLeadDto } from './dto/transfer-lead.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';

const toEnumStatus = (s?: string | null) =>
  (s ? s.toUpperCase() : undefined) as any;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [total, byStatus] = await Promise.all([
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { deletedAt: null },
      }),
    ]);
    const statusMap: Record<string, number> = {};
    byStatus.forEach((r) => (statusMap[r.status as string] = r._count._all));
    return { success: true, data: { total, byStatus: statusMap } };
  }

  async list({
    page = 1,
    limit = 10,
    status,
    search,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const where: Prisma.LeadWhereInput = { deletedAt: null };
    if (status) where.status = toEnumStatus(status);
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
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          tags: { select: { tag: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items.map((l) => ({ ...l, tags: l.tags.map((t) => t.tag) })),
        total,
        page,
        limit,
      },
    };
  }

  async getById(id: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tags: { select: { tag: true } },
        convertedToContact: true,
      },
    });
    if (!lead) return { success: false, message: 'Lead not found' };
    return {
      success: true,
      data: { ...lead, tags: lead.tags.map((t) => t.tag) },
    };
  }

  async create(dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        position: dto.position,
        notes: dto.notes,
        status: toEnumStatus(dto.status) ?? 'NEW',
        sourceId: dto.sourceId,
        assignedTo: dto.assignedTo ?? null,
        budget: dto.budget as any,
        currency: dto.currency ?? 'USD',
      },
    });

    if (dto.tags?.length) {
      await this.prisma.leadTag.createMany({
        data: dto.tags.map((tagId) => ({ leadId: lead.id, tagId })),
        skipDuplicates: true,
      });
    }

    return {
      success: true,
      message: 'Lead created successfully',
      data: { lead },
    };
  }

  async update(id: number, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        position: dto.position,
        notes: dto.notes,
        status: toEnumStatus(dto.status),
        sourceId: dto.sourceId,
        assignedTo: dto.assignedTo ?? undefined,
        budget: dto.budget as any,
        currency: dto.currency,
        updatedAt: new Date(),
      },
    });

    if (dto.tags) {
      await this.prisma.leadTag.deleteMany({ where: { leadId: id } });
      if (dto.tags.length)
        await this.prisma.leadTag.createMany({
          data: dto.tags.map((tagId) => ({ leadId: id, tagId })),
        });
    }

    return {
      success: true,
      message: 'Lead updated successfully',
      data: { lead },
    };
  }

  async remove(id: number) {
    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true, message: 'Lead deleted successfully' };
  }

  async transfer(id: number, dto: TransferLeadDto) {
    const lead = await this.prisma.lead.update({
      where: { id },
      data: { assignedTo: dto.newUserId ?? null, updatedAt: new Date() },
    });
    return { success: true, message: 'Lead transferred', data: { lead } };
  }

  async bulkAssign(dto: BulkAssignDto) {
    await this.prisma.lead.updateMany({
      where: { id: { in: dto.leadIds } },
      data: { assignedTo: dto.newUserId ?? null },
    });
    return { success: true, message: 'Leads assigned' };
  }

  async convert(id: number, dto: ConvertLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) return { success: false, message: 'Lead not found' };
    if (lead.status === 'CONVERTED')
      return { success: false, message: 'Lead is already converted' };

    const result = await this.prisma.$transaction(async (tx: PrismaClient) => {
      let createdContact: any = null;
      let createdCompany: any = null;
      let createdDeal: any = null;

      if (dto.createContact) {
        const email = dto.contactData?.email || lead.email;
        const existing = await tx.contact.findFirst({
          where: { email, deletedAt: null },
        });
        if (existing) {
          createdContact = existing;
        } else {
          createdContact = await (tx as any).contact.create({
            data: {
              firstName: dto.contactData?.firstName || lead.firstName,
              lastName: dto.contactData?.lastName || lead.lastName,
              email,
              phone: dto.contactData?.phone || lead.phone,
              company: dto.contactData?.company || lead.company,
              position: dto.contactData?.position || lead.position,
              address: dto.contactData?.address || lead.address,
              website: dto.contactData?.website || lead.website,
              notes: dto.contactData?.notes || lead.notes,
              assignedTo: lead.assignedTo,
              companyId: lead.companyId,
            },
          });
        }
      }

      if (dto.createCompany && dto.companyData?.name) {
        const existingCompany = await (tx as any).companies.findFirst({
          where: { name: dto.companyData.name },
        });
        if (existingCompany) {
          createdCompany = existingCompany;
        } else {
          createdCompany = await (tx as any).companies.create({
            data: {
              name: dto.companyData.name,
              domain: dto.companyData.domain,
              slug:
                dto.companyData.slug ||
                dto.companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              industryId: dto.companyData.industryId,
              updatedAt: new Date(),
            },
          });
        }
      }

      if (dto.createDeal && dto.dealData?.title) {
        createdDeal = await (tx as any).deal.create({
          data: {
            title: dto.dealData.title,
            description: dto.dealData.description,
            value: dto.dealData.value as any,
            currency: dto.dealData.currency || 'USD',
            status: toEnumStatus(dto.dealData.status) || 'DRAFT',
            probability: dto.dealData.probability || 0,
            expectedCloseDate: dto.dealData.expectedCloseDate
              ? new Date(dto.dealData.expectedCloseDate)
              : null,
            assignedTo: lead.assignedTo,
            contactId: createdContact?.id ?? null,
            leadId: lead.id,
            companyId: createdCompany?.id || lead.companyId || null,
          },
        });
      }

      const updatedLead = await (tx as any).lead.update({
        where: { id: lead.id },
        data: {
          status: 'CONVERTED',
          convertedToContactId: createdContact?.id ?? null,
          updatedAt: new Date(),
        },
      });

      return {
        lead: updatedLead,
        contact: createdContact,
        company: createdCompany,
        deal: createdDeal,
      };
    });

    return { success: true, data: result };
  }
}
