import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BulkAssignDto } from './dto/bulk-assign.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TransferLeadDto } from './dto/transfer-lead.dto';
import { AutomationService } from '../automation/automation.service';
import { WorkflowTrigger } from '../automation/dto/create-workflow.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import {
  PrismaClient,
  LeadPriority,
  LeadStatus,
} from '@prisma/client';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';

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

// --- UPDATED HELPER: normalizeLeadStatus ---
function normalizeLeadStatus(status?: string): LeadStatus {
  if (!status) return LeadStatus.NEW;
  const upper = String(status).toUpperCase();
  if (Object.values(LeadStatus).includes(upper as any)) {
    return upper as LeadStatus;
  }
  return LeadStatus.NEW;
}

function normalizeLeadPriority(priority?: string): LeadPriority {
  if (!priority) return LeadPriority.MEDIUM;
  const up = priority.toUpperCase();
  return (LeadPriority as any)[up] ?? LeadPriority.MEDIUM;
}

function toEnumStatus(status?: string): any {
  if (!status) return 'DRAFT';
  return status.toUpperCase();
}

// Generate a deterministic color for a given string (used when creating LeadSource)
function generateColorFromString(input: string): string {
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  ];
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    // simple hash
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // convert to 32bit int
  }
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async getStats() {
    const baseWhere = { deletedAt: null };
    const totalLeads = await this.prisma.lead.count({ where: baseWhere });

    const grouped = await this.prisma.lead.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { _all: true },
    });

    const summary: any = {
      totalLeads,
      activeLeads: 0,
    };

    grouped.forEach((group) => {
      const status = group.status.toLowerCase();
      summary[`${status}Leads`] = group._count._all;
    });

    const lostCount = summary['lostLeads'] || 0;
    const convertedCount = summary['convertedLeads'] || 0;
    summary.activeLeads = Math.max(0, totalLeads - lostCount - convertedCount);

    return {
      success: true,
      data: {
        ...summary,
        total: totalLeads,
        converted: convertedCount,
        active: summary.activeLeads,
      },
    };
  }

  // --- UPDATED METHOD: list ---
  async list({
    page,
    limit,
    status,
    search,
    email,
    isDeleted,
    assignedTo,
  }: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    email?: string;
    isDeleted?: boolean;
    assignedTo?: number;
  }, user?: any) {
    try {
      const pageNum = Math.max(1, Number(page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

      const where: any = {};

      // Deletion filter
      if (isDeleted === true) {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }

      // Role-based filtering
      if (user && user.userId) {
        const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
        if (Object.keys(roleBasedWhere).length > 0) {
          if (where.AND) {
            where.AND.push(roleBasedWhere);
          } else {
            where.AND = [roleBasedWhere];
          }
        }
      }

      // Assigned User filter
      if (assignedTo !== undefined) {
        where.assignedTo = assignedTo;
      }

      // Status filter
      if (status && String(status).trim() !== '') {
        where.status = String(status).toUpperCase();
      }

      // Email filter
      if (email && String(email).trim() !== '') {
        where.email = { contains: String(email).trim(), mode: 'insensitive' };
      }

      // Search filter - must be combined with role-based filter using AND
      if (search && String(search).trim() !== '') {
        const q = String(search).trim();
        const searchFilter = {
          OR: [
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
          ],
        };

        // Combine with existing AND condition if it exists
        if (where.AND) {
          where.AND.push(searchFilter);
        } else {
          where.AND = [searchFilter];
        }
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

  async getById(id: number, user?: any) {
    const where: any = { id, deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
      if (Object.keys(roleBasedWhere).length > 0) {
        if (where.AND) {
          where.AND.push(roleBasedWhere);
        } else {
          where.AND = [roleBasedWhere];
        }
      }
    }

    const leadRow: any = await this.prisma.lead.findFirst({
      where,
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tags: { include: { tag: true } },
        source: {
          select: { id: true, name: true, description: true },
        },
        invoices: {
          include: {
            payments: {
              include: { createdByUser: { select: { id: true, firstName: true, lastName: true } } }
            }
          }
        },
        quotations: true,
      },
    });
    if (!leadRow) return { success: false, message: 'Lead not found' };

    // Flatten payments from invoices
    const payments = leadRow.invoices?.flatMap((inv: any) => inv.payments?.map((p: any) => ({ ...p, invoiceNumber: inv.invoiceNumber })) || []) || [];

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
      payments,
    };

    return { success: true, data: { lead } };
  }

  // Validate dynamic fields based on field configurations
  async validateDynamicFields(data: any, isUpdate: boolean = false) {
    const fieldConfigs = await this.prisma.fieldConfig.findMany({
      where: { entityType: 'lead', isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });

    const errors: Record<string, string> = {};

    for (const config of fieldConfigs) {
      const fieldName = config.fieldName;
      // Check both direct fields and customFields
      const value = data[fieldName] !== undefined ? data[fieldName] : (data.customFields?.[fieldName]);

      // Required validation
      if (config.isRequired) {
        // For updates, if the field is not present in the payload (undefined), we skip validation
        // This allows partial updates (like just changing status) without sending all required fields
        if (isUpdate && value === undefined) {
          continue;
        }

        if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && !value.trim())) {
          errors[fieldName] = `${config.label} is required`;
          continue; // Skip other validations if required field is missing
        }
      }

      // Skip validation if field is empty and not required
      if (value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
        continue;
      }

      // Type-specific validation
      const validation = config.validation as any;
      if (validation?.type) {
        switch (validation.type) {
          case 'email':
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            if (!emailRegex.test(String(value))) {
              errors[fieldName] = `${config.label} must be a valid email address`;
            }
            break;

          case 'phone':
            const phoneRegex = /^[0-9+\s()-]+$/;
            const digitsOnly = String(value).replace(/\D/g, '');
            if (!phoneRegex.test(String(value)) || digitsOnly.length < 7 || digitsOnly.length > 15) {
              errors[fieldName] = `${config.label} must be a valid phone number`;
            }
            break;

          case 'number':
            const numValue = Number(value);
            if (isNaN(numValue)) {
              errors[fieldName] = `${config.label} must be a valid number`;
            } else {
              if (validation.min !== undefined && numValue < validation.min) {
                errors[fieldName] = `${config.label} must be at least ${validation.min}`;
              }
              if (validation.max !== undefined && numValue > validation.max) {
                errors[fieldName] = `${config.label} must be at most ${validation.max}`;
              }
            }
            break;

          case 'url':
            try {
              new URL(String(value));
            } catch {
              errors[fieldName] = `${config.label} must be a valid URL`;
            }
            break;

          case 'text':
            const textValue = String(value);
            if (validation.minLength !== undefined && textValue.length < validation.minLength) {
              errors[fieldName] = `${config.label} must be at least ${validation.minLength} characters`;
            }
            if (validation.maxLength !== undefined && textValue.length > validation.maxLength) {
              errors[fieldName] = `${config.label} must not exceed ${validation.maxLength} characters`;
            }
            if (validation.pattern) {
              const pattern = new RegExp(validation.pattern);
              if (!pattern.test(textValue)) {
                errors[fieldName] = `${config.label} format is invalid`;
              }
            }
            break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new HttpException(
        { success: false, message: 'Validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --- UPDATED METHOD: create ---
  async create(dto: CreateLeadDto, userId?: number) {
    // Validate dynamic fields
    await this.validateDynamicFields(dto);

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

    const { tags, customFields, ...leadData } = dto as any;

    // Get field configs to determine which fields go to customFields
    const fieldConfigs = await this.prisma.fieldConfig.findMany({
      where: { entityType: 'lead', isVisible: true },
    });

    const standardFields = [
      'firstName', 'lastName', 'email', 'phone', 'company', 'position', 'industry',
      'website', 'companySize', 'annualRevenue', 'address', 'country', 'state', 'city',
      'zipCode', 'linkedinProfile', 'timezone', 'preferredContactMethod', 'sourceId',
      'status', 'priority', 'assignedTo', 'budget', 'currency', 'leadScore', 'notes',
      'tags', 'lastContactedAt', 'nextFollowUpAt'
    ];

    // Separate standard fields from custom fields
    const standardFieldData: any = {};
    const customFieldsData: any = { ...(customFields || {}) };

    Object.keys(dto).forEach(key => {
      if (standardFields.includes(key)) {
        standardFieldData[key] = (dto as any)[key];
      } else if (!['tags', 'customFields'].includes(key)) {
        // This is a custom field
        customFieldsData[key] = (dto as any)[key];
      }
    });

    const lead = await this.prisma.lead.create({
      data: {
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        email: dto.email || null,
        phone: dto.phone || null,
        company: dto.company || null,
        position: dto.position || null,
        industry: dto.industry || null,
        website: dto.website || null,
        companySize: dto.companySize || null,
        annualRevenue: dto.annualRevenue as any || null,
        address: dto.address || null,
        country: dto.country || null,
        state: dto.state || null,
        city: dto.city || null,
        zipCode: dto.zipCode || null,
        linkedinProfile: dto.linkedinProfile || null,
        timezone: dto.timezone || null,
        preferredContactMethod: dto.preferredContactMethod ?? 'email',
        status: normalizeLeadStatus(dto.status),
        priority: normalizeLeadPriority(dto.priority),
        sourceId: dto.sourceId || null,
        assignedTo: dto.assignedTo || userId || null, // <--- Auto-assign to creator if not specified
        createdBy: userId || null, // <--- Save creator ID
        budget: dto.budget as any || null,
        currency: currency, // <--- Use the calculated currency here
        leadScore: dto.leadScore || null,
        notes: dto.notes || null,
        lastContactedAt: dto.lastContactedAt
          ? new Date(dto.lastContactedAt)
          : null,
        nextFollowUpAt: dto.nextFollowUpAt
          ? new Date(dto.nextFollowUpAt)
          : null,
        customFields: Object.keys(customFieldsData).length > 0 ? customFieldsData : null,
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

    // Trigger automation for LEAD_CREATED
    try {
      await this.automationService.executeWorkflowsForTrigger(
        WorkflowTrigger.LEAD_CREATED,
        { ...formattedLead, entityType: 'lead' },
      );
    } catch (error) {
      console.error('Failed to execute automation for LEAD_CREATED:', error);
    }

    // Log Activity
    try {
      await this.prisma.activity.create({
        data: {
          type: 'LEAD_CREATED',
          title: 'New Lead Created',
          description: `Lead ${lead.firstName} ${lead.lastName} was created.`,
          userId: userId || 1,
          leadId: lead.id,
        }
      });
    } catch (error) {
      console.error('Failed to log lead creation activity:', error);
    }

    // Send notification if lead is assigned
    if (dto.assignedTo) {
      try {
        await this.notificationsService.notifyLeadEvent(
          NotificationType.LEAD_ASSIGNED,
          dto.assignedTo,
          lead.id,
          `${lead.firstName} ${lead.lastName}`,
        );
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    return { success: true, data: formattedLead };
  }

  async update(id: number, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) return { success: false, message: 'Lead not found' };

    // Validate dynamic fields
    await this.validateDynamicFields(dto, true);

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

    // Trigger automation workflows based on what changed
    try {
      // Always trigger LEAD_UPDATED
      await this.automationService.executeWorkflowsForTrigger(
        WorkflowTrigger.LEAD_UPDATED,
        { ...normalized, entityType: 'lead', previousStatus: lead.status },
      );

      // Trigger LEAD_STATUS_CHANGED if status changed
      if (rest.status && lead.status !== updated.status) {
        await this.automationService.executeWorkflowsForTrigger(
          WorkflowTrigger.LEAD_STATUS_CHANGED,
          { ...normalized, entityType: 'lead', oldStatus: lead.status, newStatus: updated.status },
        );
      }

      // Trigger LEAD_ASSIGNED if assigned user changed
      if (rest.assignedTo !== undefined && lead.assignedTo !== updated.assignedTo) {
        await this.automationService.executeWorkflowsForTrigger(
          WorkflowTrigger.LEAD_ASSIGNED,
          { ...normalized, entityType: 'lead', oldAssignedTo: lead.assignedTo, newAssignedTo: updated.assignedTo },
        );

        // Send notification to newly assigned user
        if (updated.assignedTo) {
          await this.notificationsService.notifyLeadEvent(
            NotificationType.LEAD_ASSIGNED,
            updated.assignedTo,
            lead.id,
            `${lead.firstName} ${lead.lastName}`,
          );
        }
      }
    } catch (error) {
      console.error('Failed to execute automation for lead update:', error);
    }

    // Send notification for status change to assigned user
    if (rest.status && lead.status !== updated.status && updated.assignedTo) {
      try {
        await this.notificationsService.notifyLeadEvent(
          NotificationType.LEAD_STATUS_CHANGED,
          updated.assignedTo,
          lead.id,
          `${lead.firstName} ${lead.lastName}`,
          String(updated.status).toLowerCase(),
        );
      } catch (error) {
        console.error('Failed to send status change notification:', error);
      }
    }

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

  async deletePermanently(id: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!lead) return { success: false, message: 'Lead not found in trash' };

    try {
      await this.prisma.lead.delete({ where: { id } });
      return { success: true, message: 'Lead deleted permanently' };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        return {
          success: false,
          message:
            'Unable to delete this lead permanently because other records still reference it. Please remove the dependencies first.',
        };
      }
      throw error;
    }
  }

  /**
   * Bulk import leads from a CSV file
   * @param file - The uploaded CSV file
   * @returns Import results with success count and error details
   */
  async bulkImportFromCsv(file: Express.Multer.File) {
    try {
      if (!file || !file.buffer) {
        return {
          success: false,
          message: 'Invalid file',
        };
      }

      // Parse CSV content
      const csvContent = file.buffer.toString('utf-8');
      const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      if (lines.length < 2) {
        return {
          success: false,
          message: 'CSV file must contain headers and at least one row of data',
        };
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredFields = ['name', 'email', 'phone'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));

      if (missingFields.length > 0) {
        return {
          success: false,
          message: `CSV must contain these columns: ${missingFields.join(', ')}`,
        };
      }

      const results = {
        success: true,
        data: {
          imported: 0,
          failed: 0,
          errors: [] as { row: number; error: string }[],
          message: '',
        },
      };

      // Process each row
      const fieldConfigs = await this.prisma.fieldConfig.findMany({
        where: { entityType: 'lead' }
      });

      const standardFields = [
        'firstName', 'lastName', 'email', 'phone', 'company', 'position', 'industry',
        'website', 'companySize', 'annualRevenue', 'address', 'country', 'state', 'city',
        'zipCode', 'linkedinProfile', 'timezone', 'preferredContactMethod', 'sourceId',
        'status', 'priority', 'assignedTo', 'budget', 'currency', 'leadScore', 'notes',
        'tags', 'lastContactedAt', 'nextFollowUpAt'
      ];

      for (let i = 1; i < lines.length; i++) {
        try {
          // Handle quoted values correctly
          const values = lines[i].match(/(".*?"|[^",\n\r]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim())
            || lines[i].split(',').map(v => v.trim());

          // Create a map of column name to value
          const row: Record<string, any> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Map 'name' to firstName/lastName if present
          if (row.name && !row.firstName) {
            const nameParts = (row.name || '').split(' ').filter(Boolean);
            row.firstName = nameParts.length > 0 ? nameParts[0] : '';
            row.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          }

          // Validate required fields based on fieldConfigs
          const errorsInRow: string[] = [];
          fieldConfigs.forEach(config => {
            if (config.isRequired && !row[config.fieldName]) {
              errorsInRow.push(`${config.label || config.fieldName} is required`);
            }
          });

          if (errorsInRow.length > 0) {
            results.data.errors.push({
              row: i + 1,
              error: errorsInRow.join(', '),
            });
            results.data.failed++;
            continue;
          }

          // Basic validation for email if it's the primary identifier
          if (!row.email) {
            results.data.errors.push({
              row: i + 1,
              error: 'Email is required for import',
            });
            results.data.failed++;
            continue;
          }

          // Check if lead with same email already exists
          const existingLead = await this.prisma.lead.findFirst({
            where: {
              email: row.email,
              deletedAt: null,
            },
          });

          if (existingLead) {
            results.data.errors.push({
              row: i + 1,
              error: `Lead with email "${row.email}" already exists`,
            });
            results.data.failed++;
            continue;
          }

          // Separate standard and custom fields
          const leadData: any = {};
          const customFieldsData: any = {};

          Object.keys(row).forEach(key => {
            if (standardFields.includes(key)) {
              if (key === 'annualRevenue' || key === 'budget' || key === 'companySize' || key === 'leadScore' || key === 'sourceId') {
                leadData[key] = row[key] ? Number(row[key]) : null;
              } else if (key === 'status') {
                leadData[key] = normalizeLeadStatus(row[key]);
              } else if (key === 'priority') {
                leadData[key] = normalizeLeadPriority(row[key]);
              } else {
                leadData[key] = row[key] || null;
              }
            } else if (key !== 'name') {
              customFieldsData[key] = row[key];
            }
          });

          await this.prisma.lead.create({
            data: {
              ...leadData,
              customFields: Object.keys(customFieldsData).length > 0 ? customFieldsData : undefined,
              source: row.source
                ? {
                  connectOrCreate: {
                    where: { name: row.source },
                    create: { name: row.source, color: generateColorFromString(row.source) },
                  },
                }
                : undefined,
            },
          });

          results.data.imported++;
        } catch (error: any) {
          results.data.errors.push({
            row: i + 1,
            error: error.message || 'Unknown error',
          });
          results.data.failed++;
        }
      }

      results.data.message = `Import completed. Imported: ${results.data.imported}, Failed: ${results.data.failed}`;
      return results;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to import leads from CSV',
      };
    }
  }

  /**
   * Export leads to CSV string. Fields are quoted to preserve commas/newlines.
   */
  async bulkExport(opts: { status?: string; search?: string } = {}) {
    const where: any = { deletedAt: null };
    if (opts.status) {
      where.status = opts.status.toUpperCase();
    }
    if (opts.search) {
      const s = String(opts.search).trim();
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { company: { contains: s, mode: 'insensitive' } },
      ];
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: { source: true, assignedUser: true },
      orderBy: { createdAt: 'desc' },
    });

    // Get dynamic field configurations
    const fieldConfigs = await this.prisma.fieldConfig.findMany({
      where: { entityType: 'lead', isVisible: true },
      orderBy: { displayOrder: 'asc' }
    });

    const headers = fieldConfigs.length > 0
      ? fieldConfigs.map(f => f.fieldName)
      : [
        'firstName',
        'lastName',
        'email',
        'phone',
        'company',
        'position',
        'status',
        'priority',
        'source',
        'assignedTo',
        'createdAt',
      ];

    const escape = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      // If contains quote, newline or comma, wrap in quotes and escape quotes
      if (/[",\n\r]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const rows = [headers.join(',')];
    for (const l of leads) {
      const row = headers.map(header => {
        // Handle standard fields
        if (header in l) {
          const val = (l as any)[header];
          if (header === 'createdAt' || header === 'updatedAt' || header === 'lastContactedAt' || header === 'nextFollowUpAt') {
            return escape(val ? new Date(val).toISOString() : '');
          }
          return escape(val);
        }

        // Handle special relations or mapped fields
        if (header === 'source') return escape(l.source?.name || '');
        if (header === 'assignedTo') return escape(l.assignedUser ? `${l.assignedUser.firstName} ${l.assignedUser.lastName}` : '');

        // Handle custom fields
        const customFields = (l.customFields as any) || {};
        if (header in customFields) {
          return escape(customFields[header]);
        }

        return '';
      });
      rows.push(row.join(','));
    }

    // Use CRLF line endings for better compatibility with Excel on Windows
    return rows.join('\r\n');
  }

  /**
   * Sync all integrations to import leads from third-party services
   */
  async syncAllIntegrations() {
    try {
      // Get all active third-party integrations
      const integrations = await this.prisma.thirdPartyIntegration.findMany({
        where: { isActive: true },
      });

      if (integrations.length === 0) {
        return {
          success: true,
          message: 'No active integrations found to sync',
          data: { synced: 0, integrations: [] },
        };
      }

      const results = {
        success: true,
        data: {
          synced: 0,
          integrations: [] as any[],
          message: '',
        },
      };

      // Process each integration
      for (const integration of integrations) {
        try {
          const syncResult = await this.syncIntegration(integration);
          results.data.integrations.push({
            id: integration.id,
            name: integration.name,
            displayName: integration.displayName,
            success: syncResult.success,
            synced: syncResult.synced || 0,
            error: syncResult.error,
          });

          if (syncResult.success) {
            results.data.synced += syncResult.synced || 0;
          }

          // Log the sync operation
          await this.prisma.integrationLog.create({
            data: {
              integrationId: integration.id,
              operation: 'SYNC_ALL',
              status: syncResult.success ? 'SUCCESS' : 'FAILED',
              message: syncResult.message || syncResult.error,
              data: {
                synced: syncResult.synced || 0,
                totalProcessed: syncResult.totalProcessed || 0,
              } as any,
            },
          });
        } catch (error: any) {
          console.error(`Failed to sync integration ${integration.name}:`, error);
          results.data.integrations.push({
            id: integration.id,
            name: integration.name,
            displayName: integration.displayName,
            success: false,
            synced: 0,
            error: error.message,
          });

          // Log the error
          await this.prisma.integrationLog.create({
            data: {
              integrationId: integration.id,
              operation: 'SYNC_ALL',
              status: 'FAILED',
              message: error.message,
              data: {} as any,
            },
          });
        }
      }

      const successCount = results.data.integrations.filter((i: any) => i.success).length;
      results.data.message = `Synced ${results.data.synced} leads from ${successCount}/${integrations.length} integrations`;

      return results;
    } catch (error: any) {
      console.error('Error syncing all integrations:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Failed to sync integrations',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sync a specific integration
   */
  private async syncIntegration(integration: any) {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would:
      // 1. Make API calls to the third-party service
      // 2. Parse the response data
      // 3. Create/update leads in the database
      // 4. Handle duplicates and conflicts

      // For now, return a mock successful result
      return {
        success: true,
        synced: 0,
        totalProcessed: 0,
        message: `Integration ${integration.displayName} synced successfully (placeholder)`,
      };
    } catch (error: any) {
      return {
        success: false,
        synced: 0,
        totalProcessed: 0,
        error: error.message,
      };
    }
  }
}
