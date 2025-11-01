import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BulkAssignDto } from './dto/bulk-assign.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TransferLeadDto } from './dto/transfer-lead.dto';
import {
  PrismaClient,
  LeadStatus,
  LeadPriority,
  DealStatus,
} from '@prisma/client';

function normalizeLeadStatus(status?: string): LeadStatus {
  if (!status) return LeadStatus.NEW;
  const up = status.toUpperCase();
  return (LeadStatus as any)[up] ?? LeadStatus.NEW;
}

function normalizeLeadPriority(priority?: string): LeadPriority {
  if (!priority) return LeadPriority.MEDIUM;
  const up = priority.toUpperCase();
  return (LeadPriority as any)[up] ?? LeadPriority.MEDIUM;
}

// Preserve legacy helper name used by convert() for Deal status mapping
function toEnumStatus(status?: string): DealStatus {
  if (!status) return DealStatus.DRAFT;
  const up = status.toUpperCase();
  return (DealStatus as any)[up] ?? DealStatus.DRAFT;
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const total = await this.prisma.lead.count({ where: { deletedAt: null } });
    const converted = await this.prisma.lead.count({
      where: { deletedAt: null, status: 'CONVERTED' },
    });
    return {
      success: true,
      data: { total, converted, active: total - converted },
    };
  }

  async list({
    page,
    limit,
    status,
    search,
  }: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

    const where: any = { deletedAt: null };
    if (status && String(status).trim() !== '') {
      const up = String(status).toUpperCase();
      if ((LeadStatus as any)[up]) where.status = (LeadStatus as any)[up];
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { position: { contains: q, mode: 'insensitive' } },
        { industry: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
        { state: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [totalItems, rows] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: {
          assignedUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
    ]);

    // Normalize enums to lowercase for frontend compatibility
    const leads = rows.map((r: any) => ({
      ...r,
      status: String(r.status || '').toLowerCase(),
      priority: r.priority ? String(r.priority).toLowerCase() : undefined,
    }));

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    return {
      success: true,
      data: {
        leads,
        pagination: {
          totalItems,
          currentPage: pageNum,
          pageSize,
          totalPages,
        },
      },
    };
  }

  async getById(id: number) {
    const leadRow: any = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tags: { include: { tag: true } },
      },
    });
    if (!leadRow) return { success: false, message: 'Lead not found' };

    const lead = {
      ...leadRow,
      status: String(leadRow.status || '').toLowerCase(),
      priority: leadRow.priority
        ? String(leadRow.priority).toLowerCase()
        : undefined,
      tags: Array.isArray(leadRow.tags)
        ? leadRow.tags.map((lt: any) => ({
            id: lt.tag.id,
            name: lt.tag.name,
            color: lt.tag.color,
          }))
        : [],
    };

    return { success: true, data: { lead } };
  }

  async create(dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        // Basic
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,

        // Company
        company: dto.company,
        position: dto.position,
        industry: dto.industry,
        website: dto.website,
        companySize: dto.companySize,
        annualRevenue: dto.annualRevenue as any,

        // Location
        address: dto.address,
        country: dto.country,
        state: dto.state,
        city: dto.city,
        zipCode: dto.zipCode,

        // Contact & Social
        linkedinProfile: dto.linkedinProfile,
        timezone: dto.timezone,
        preferredContactMethod: dto.preferredContactMethod ?? 'email',

        // Lead Management
        status: normalizeLeadStatus(dto.status),
        priority: normalizeLeadPriority(dto.priority),
        sourceId: dto.sourceId,
        assignedTo: dto.assignedTo,

        // Business
        budget: dto.budget as any,
        currency: dto.currency ?? 'USD',
        leadScore: dto.leadScore,

        // Notes
        notes: dto.notes,

        // Timing
        lastContactedAt: dto.lastContactedAt
          ? new Date(dto.lastContactedAt)
          : null,
        nextFollowUpAt: dto.nextFollowUpAt
          ? new Date(dto.nextFollowUpAt)
          : null,
      },
    });

    // NOTE: Tag relationships can be handled here later if needed (LeadTag createMany)

    return { success: true, data: lead };
  }

  async update(id: number, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) return { success: false, message: 'Lead not found' };

    // Remove fields that are not directly updatable on Lead model
    const { tags, ...rest } = dto as any;

    const updateData: any = { ...rest, updatedAt: new Date() };
    if (rest.status) updateData.status = normalizeLeadStatus(rest.status);
    if (rest.priority)
      updateData.priority = normalizeLeadPriority(rest.priority);
    if (rest.lastContactedAt)
      updateData.lastContactedAt = new Date(rest.lastContactedAt);
    if (rest.nextFollowUpAt)
      updateData.nextFollowUpAt = new Date(rest.nextFollowUpAt);

    const updated = await this.prisma.lead.update({
      where: { id },
      data: updateData,
    });

    // TODO: handle tag relation updates if needed

    // Return normalized shape
    const normalized = {
      ...updated,
      status: String(updated.status || '').toLowerCase(),
      priority: updated.priority
        ? String(updated.priority).toLowerCase()
        : undefined,
    } as any;

    return { success: true, data: { lead: normalized } };
  }

  async remove(id: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) return { success: false, message: 'Lead not found' };

    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Lead deleted' };
  }

  async transfer(id: number, dto: TransferLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) return { success: false, message: 'Lead not found' };

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        assignedTo: dto.newUserId ?? null,
        updatedAt: new Date(),
      },
    });
    return { success: true, message: 'Lead transferred', data: updated };
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
