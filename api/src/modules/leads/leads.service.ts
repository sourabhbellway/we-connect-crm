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
            tags: { include: { tag: true } },
            source: {
              select: { id: true, name: true, description: true },
            },
          },
        }),
      ]);

      const leads = rows.map((r: any) => {
        // Extract tags and source from Prisma response
        const rawTags = r.tags || [];
        const rawSource = r.source || null;
        
        // Build the lead object explicitly
        return {
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          phone: r.phone,
          company: r.company,
          position: r.position,
        status: String(r.status || '').toLowerCase(),
          notes: r.notes,
          isActive: r.isActive,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          sourceId: r.sourceId,
          assignedTo: r.assignedTo,
          companyId: r.companyId,
          deletedAt: r.deletedAt,
          budget: r.budget,
          currency: r.currency,
          lastContactedAt: r.lastContactedAt,
          nextFollowUpAt: r.nextFollowUpAt,
        priority: r.priority ? String(r.priority).toLowerCase() : undefined,
          industry: r.industry,
          website: r.website,
          companySize: r.companySize,
          annualRevenue: r.annualRevenue,
          leadScore: r.leadScore,
          address: r.address,
          country: r.country,
          state: r.state,
          city: r.city,
          zipCode: r.zipCode,
          linkedinProfile: r.linkedinProfile,
          timezone: r.timezone,
          preferredContactMethod: r.preferredContactMethod,
          previousStatus: r.previousStatus,
          convertedToDealId: r.convertedToDealId,
          assignedUser: r.assignedUser,
          tags: Array.isArray(rawTags) && rawTags.length > 0
            ? rawTags.map((lt: any) => ({
                id: lt.tag?.id || lt.id,
                name: lt.tag?.name || lt.name,
                color: lt.tag?.color || lt.color,
              }))
            : [],
          source: rawSource,
        };
      });

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
        source: {
          select: { id: true, name: true, description: true },
        },
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

    const { tags, ...leadData } = dto as any;

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

    // Handle tags if provided
    if (Array.isArray(tags) && tags.length > 0) {
      await this.prisma.leadTag.createMany({
        data: tags.map((tagId: number) => ({
          leadId: lead.id,
          tagId: tagId,
        })),
        skipDuplicates: true,
      });
    }

    // Fetch the lead with tags and source for response
    const leadWithTags = await this.prisma.lead.findUnique({
      where: { id: lead.id },
      include: {
        tags: { include: { tag: true } },
        source: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    const formattedLead = leadWithTags ? {
      ...leadWithTags,
      status: String(leadWithTags.status || '').toLowerCase(),
      priority: leadWithTags.priority ? String(leadWithTags.priority).toLowerCase() : undefined,
      tags: Array.isArray(leadWithTags.tags)
        ? leadWithTags.tags.map((lt: any) => ({
            id: lt.tag.id,
            name: lt.tag.name,
            color: lt.tag.color,
          }))
        : [],
    } : lead;

    return { success: true, data: formattedLead };
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

    // Handle tags if provided
    if (Array.isArray(tags)) {
      // Delete existing tags
      await this.prisma.leadTag.deleteMany({
        where: { leadId: id },
      });
      
      // Create new tags
      if (tags.length > 0) {
        await this.prisma.leadTag.createMany({
          data: tags.map((tagId: number) => ({
            leadId: id,
            tagId: tagId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Create activity for lead updates with detailed messages
    try {
      const changes: string[] = [];
      let activityType = 'LEAD_UPDATED';
      let title = 'Lead updated';
      let icon = 'Edit';
      let iconColor = '#6B7280';

      // Check status change
      if (rest.status && lead.status !== updated.status) {
        activityType = 'LEAD_STATUS_CHANGED';
        title = 'Status changed';
        icon = 'TrendingUp';
        iconColor = '#10B981';
        changes.push(`Status: ${String(lead.status).toLowerCase()} → ${String(updated.status).toLowerCase()}`);
      }

      // Check priority change
      if (rest.priority && lead.priority !== updated.priority) {
        if (activityType === 'LEAD_UPDATED') {
          title = 'Priority changed';
          icon = 'Flag';
          iconColor = '#F59E0B';
        }
        changes.push(`Priority: ${String(lead.priority).toLowerCase()} → ${String(updated.priority).toLowerCase()}`);
      }

      // Check assignment change
      if (rest.assignedTo !== undefined && lead.assignedTo !== updated.assignedTo) {
        if (activityType === 'LEAD_UPDATED') {
          activityType = 'LEAD_ASSIGNED';
          title = 'Lead assigned';
          icon = 'User';
          iconColor = '#3B82F6';
        }
        if (updated.assignedTo) {
          const assignedUser = await this.prisma.user.findUnique({
            where: { id: updated.assignedTo },
            select: { firstName: true, lastName: true },
          });
          const userName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'User';
          changes.push(`Assigned to: ${userName}`);
        } else {
          changes.push('Unassigned');
        }
      }

      // Check other field changes
      if (rest.sourceId !== undefined && lead.sourceId !== updated.sourceId) {
        changes.push('Source updated');
      }
      if (rest.budget !== undefined && lead.budget !== updated.budget) {
        changes.push(`Budget: ${lead.budget || 'N/A'} → ${updated.budget || 'N/A'}`);
      }
      if (rest.leadScore !== undefined && lead.leadScore !== updated.leadScore) {
        changes.push(`Lead Score: ${lead.leadScore || 0} → ${updated.leadScore || 0}`);
      }
      if (rest.company !== undefined && lead.company !== updated.company) {
        changes.push(`Company: ${lead.company || 'N/A'} → ${updated.company || 'N/A'}`);
      }
      if (rest.email !== undefined && lead.email !== updated.email) {
        changes.push(`Email: ${lead.email} → ${updated.email}`);
      }
      if (rest.phone !== undefined && lead.phone !== updated.phone) {
        changes.push(`Phone: ${lead.phone || 'N/A'} → ${updated.phone || 'N/A'}`);
      }

      const description = changes.length > 0 
        ? changes.join(', ')
        : 'Lead information updated';

      await this.prisma.activity.create({
        data: {
          title,
          description,
          type: activityType as any,
          icon,
          iconColor,
          metadata: {
            leadId: id,
            oldStatus: lead.status,
            newStatus: updated.status,
            oldPriority: lead.priority,
            newPriority: updated.priority,
            oldAssignedTo: lead.assignedTo,
            newAssignedTo: updated.assignedTo,
            changes,
          } as any,
          userId: lead.assignedTo || 1,
          leadId: id,
        },
      });
    } catch (error) {
      console.error('Error creating lead update activity:', error);
    }

    // Fetch the updated lead with tags and source for response
    const updatedWithTags = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        source: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    const normalized = updatedWithTags ? {
      ...updatedWithTags,
      status: String(updatedWithTags.status || '').toLowerCase(),
      priority: updatedWithTags.priority
        ? String(updatedWithTags.priority).toLowerCase()
        : undefined,
      tags: Array.isArray(updatedWithTags.tags)
        ? updatedWithTags.tags.map((lt: any) => ({
            id: lt.tag.id,
            name: lt.tag.name,
            color: lt.tag.color,
          }))
        : [],
      source: updatedWithTags.source || null,
    } : {
      ...updated,
      status: String(updated.status || '').toLowerCase(),
      priority: updated.priority
        ? String(updated.priority).toLowerCase()
        : undefined,
      tags: [],
      source: null,
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
      where: { 
        id, 
        deletedAt: null,
        convertedToDealId: { not: null }, // Check if lead has a converted deal ID
      },
    });

    if (!lead) {
      return { success: false, message: 'This lead cannot be reverted. It may not have been converted or the conversion link is missing.' };
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
