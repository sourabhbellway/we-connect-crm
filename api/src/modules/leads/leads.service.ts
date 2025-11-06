import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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

// --- NEW CODE: Country-to-Currency Mapping ---
const countryCurrencyMap: { [key: string]: string } = {
  'United States': 'USD',
  'USA': 'USD',
  'India': 'INR',
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Japan': 'JPY',
  'China': 'CNY',
  'UAE': 'AED',
};

function getCurrencyByCountry(country: string): string | null {
  if (!country) return null;
  const normalizedCountry = country.trim().toLowerCase();
  const foundKey = Object.keys(countryCurrencyMap).find(
    (key) => key.toLowerCase() === normalizedCountry
  );
  return foundKey ? countryCurrencyMap[foundKey] : null;
}
// --- NEW CODE END ---

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

  // --- UPDATED METHOD: list ---
  async list({
    page,
    limit,
    status,
    search,
    isDeleted, // <--- यह नया parameter add किया गया है
  }: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    isDeleted?: boolean; // <--- यह boolean है
  }) {
    try {
      const pageNum = Math.max(1, Number(page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

      // --- यह where clause को dynamic बनाया गया है ---
      const where: any = {};
      if (isDeleted === true) {
        where.deletedAt = { not: null }; // <--- Deleted leads के लिए
      } else {
        where.deletedAt = null; // <--- Active leads के लिए (default behavior)
      }

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
    } catch (error: any) {
      console.error('Error in leads.list:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  // --- UPDATED METHOD: create ---
  async create(dto: CreateLeadDto) {
    // 1. Check if user provided a currency manually
    let currency = dto.currency;

    // 2. If not, try to set it based on the country
    if (!currency && dto.country) {
      const defaultCurrency = getCurrencyByCountry(dto.country);
      if (defaultCurrency) {
        currency = defaultCurrency;
      }
    }

    // 3. If still no currency, fall back to a global default
    if (!currency) {
      currency = 'USD';
    }

    const lead = await this.prisma.lead.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        position: dto.position,
        industry: dto.industry,
        website: dto.website,
        companySize: dto.companySize,
        annualRevenue: dto.annualRevenue as any,
        address: dto.address,
        country: dto.country,
        state: dto.state,
        city: dto.city,
        zipCode: dto.zipCode,
        linkedinProfile: dto.linkedinProfile,
        timezone: dto.timezone,
        preferredContactMethod: dto.preferredContactMethod ?? 'email',
        status: normalizeLeadStatus(dto.status),
        priority: normalizeLeadPriority(dto.priority),
        sourceId: dto.sourceId,
        assignedTo: dto.assignedTo,
        budget: dto.budget as any,
        currency: currency, // <--- Use the calculated currency here
        leadScore: dto.leadScore,
        notes: dto.notes,
        lastContactedAt: dto.lastContactedAt
          ? new Date(dto.lastContactedAt)
          : null,
        nextFollowUpAt: dto.nextFollowUpAt
          ? new Date(dto.nextFollowUpAt)
          : null,
      },
    });

    return { success: true, data: lead };
  }

  async update(id: number, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) return { success: false, message: 'Lead not found' };

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

    // Create activity for lead updates
    try {
      const activityType = rest.status && lead.status !== updated.status
        ? 'LEAD_STATUS_CHANGED'
        : rest.assignedTo && lead.assignedTo !== updated.assignedTo
        ? 'LEAD_ASSIGNED'
        : 'LEAD_UPDATED';

      let description = 'Lead updated';
      if (rest.status && lead.status !== updated.status) {
        description = `Lead status changed from ${lead.status} to ${updated.status}`;
      } else if (rest.priority && lead.priority !== updated.priority) {
        description = `Lead priority changed to ${updated.priority}`;
      } else if (rest.assignedTo && lead.assignedTo !== updated.assignedTo) {
        description = 'Lead assigned to user';
      }

      await this.prisma.activity.create({
        data: {
          title: activityType === 'LEAD_STATUS_CHANGED' ? 'Status changed' : activityType === 'LEAD_ASSIGNED' ? 'Lead assigned' : 'Lead updated',
          description,
          type: activityType as any,
          icon: activityType === 'LEAD_STATUS_CHANGED' ? 'TrendingUp' : activityType === 'LEAD_ASSIGNED' ? 'User' : 'Edit',
          iconColor: activityType === 'LEAD_STATUS_CHANGED' ? '#10B981' : activityType === 'LEAD_ASSIGNED' ? '#3B82F6' : '#6B7280',
          metadata: {
            leadId: id,
            oldStatus: lead.status,
            newStatus: updated.status,
            oldPriority: lead.priority,
            newPriority: updated.priority,
            oldAssignedTo: lead.assignedTo,
            newAssignedTo: updated.assignedTo,
          } as any,
          userId: lead.assignedTo || 1,
          leadId: id,
        },
      });
    } catch (error) {
      console.error('Error creating lead update activity:', error);
    }

    const normalized = {
      ...updated,
      status: String(updated.status || '').toLowerCase(),
      priority: updated.priority
        ? String(updated.priority).toLowerCase()
        : undefined,
    } as any;

    return { success: true, data: { lead: normalized } };
  }

  // --- UPDATED METHOD: remove (अब भी soft delete है) ---
  async remove(id: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) return { success: false, message: 'Lead not found' };

    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Lead moved to trash' }; // <--- Message थोड़ दिया
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
      let createdCompany: any = null;
      let createdDeal: any = null;

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

      if (dto.createDeal) {
        const fallbackTitleBase = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || `Lead #${lead.id}`;
        const title = dto.dealData?.title || `${fallbackTitleBase} - Deal`;
        createdDeal = await (tx as any).deal.create({
          data: {
            title,
            description: dto.dealData?.description,
            value: ((dto.dealData?.value ?? (lead as any).budget ?? 0) as any),
            currency: dto.dealData?.currency || (lead as any).currency || 'USD',
            status: toEnumStatus(dto.dealData?.status) || 'DRAFT',
            probability: dto.dealData?.probability || 0,
            expectedCloseDate: dto.dealData?.expectedCloseDate
              ? new Date(dto.dealData.expectedCloseDate)
              : null,
            assignedTo: lead.assignedTo,
            leadId: lead.id,
            companyId: createdCompany?.id || lead.companyId || null,
          },
        });
      }

      const updatedLead = await (tx as any).lead.update({
        where: { id: lead.id },
        data: {
          status: 'CONVERTED',
          previousStatus: lead.status,
          convertedToDealId: createdDeal?.id ?? null,
          updatedAt: new Date(),
        },
      });

      return {
        lead: updatedLead,
        company: createdCompany,
        deal: createdDeal,
      };
    });

    return { success: true, data: result };
  }

  async undoLeadConversion(id: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null, status: 'CONVERTED' },
    });

    if (!lead) {
      return { success: false, message: 'This lead cannot be reverted.' };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      
      if (lead.convertedToDealId) {
        await tx.deal.update({
          where: { id: lead.convertedToDealId },
          data: { deletedAt: new Date() },
        });
      }
      
      const revertedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: lead.previousStatus || 'QUALIFIED',
          previousStatus: null,
          convertedToDealId: null,
          updatedAt: new Date(),
        },
      });

      return { lead: revertedLead };
    });

    return { success: true, message: 'Lead conversion reverted successfully.', data: result };
  }

  // --- NEW METHOD: restore ---
  async restore(id: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: { not: null } }, // <--- सिर्फ deleted lead को ही restore कर सकेंगे
    });
    if (!lead) return { success: false, message: 'Lead not found in trash' };

    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: null }, // <--- deletedAt को null करके restore कर दें
    });
    return { success: true, message: 'Lead restored successfully' };
  }
}
