"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const automation_service_1 = require("../automation/automation.service");
const create_workflow_dto_1 = require("../automation/dto/create-workflow.dto");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const countryCurrencyMap = {
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
function getCurrencyByCountry(country) {
    if (!country)
        return null;
    const normalizedCountry = country.trim().toLowerCase();
    const foundKey = Object.keys(countryCurrencyMap).find((key) => key.toLowerCase() === normalizedCountry);
    return foundKey ? countryCurrencyMap[foundKey] : null;
}
function normalizeLeadStatus(status) {
    if (!status)
        return client_2.LeadStatus.NEW;
    const up = status.toUpperCase();
    return client_2.LeadStatus[up] ?? client_2.LeadStatus.NEW;
}
function normalizeLeadPriority(priority) {
    if (!priority)
        return client_2.LeadPriority.MEDIUM;
    const up = priority.toUpperCase();
    return client_2.LeadPriority[up] ?? client_2.LeadPriority.MEDIUM;
}
function toEnumStatus(status) {
    if (!status)
        return client_2.DealStatus.DRAFT;
    const up = status.toUpperCase();
    return client_2.DealStatus[up] ?? client_2.DealStatus.DRAFT;
}
let LeadsService = class LeadsService {
    prisma;
    automationService;
    notificationsService;
    constructor(prisma, automationService, notificationsService) {
        this.prisma = prisma;
        this.automationService = automationService;
        this.notificationsService = notificationsService;
    }
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
    async list({ page, limit, status, search, isDeleted, }) {
        try {
            const pageNum = Math.max(1, Number(page) || 1);
            const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));
            const where = {};
            if (isDeleted === true) {
                where.deletedAt = { not: null };
            }
            else {
                where.deletedAt = null;
            }
            if (status && String(status).trim() !== '') {
                const up = String(status).toUpperCase();
                if (client_2.LeadStatus[up])
                    where.status = client_2.LeadStatus[up];
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
            const leads = rows.map((r) => {
                const rawTags = r.tags || [];
                const rawSource = r.source || null;
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
                        ? rawTags.map((lt) => ({
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
        }
        catch (error) {
            console.error('Error in leads.list:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getById(id) {
        const leadRow = await this.prisma.lead.findFirst({
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
        if (!leadRow)
            return { success: false, message: 'Lead not found' };
        const lead = {
            ...leadRow,
            status: String(leadRow.status || '').toLowerCase(),
            priority: leadRow.priority
                ? String(leadRow.priority).toLowerCase()
                : undefined,
            tags: Array.isArray(leadRow.tags)
                ? leadRow.tags.map((lt) => ({
                    id: lt.tag.id,
                    name: lt.tag.name,
                    color: lt.tag.color,
                }))
                : [],
        };
        return { success: true, data: { lead } };
    }
    async create(dto) {
        let currency = dto.currency;
        if (!currency && dto.country) {
            const defaultCurrency = getCurrencyByCountry(dto.country);
            if (defaultCurrency) {
                currency = defaultCurrency;
            }
        }
        if (!currency) {
            currency = 'USD';
        }
        const { tags, ...leadData } = dto;
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
                annualRevenue: dto.annualRevenue,
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
                budget: dto.budget,
                currency: currency,
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
        if (Array.isArray(tags) && tags.length > 0) {
            await this.prisma.leadTag.createMany({
                data: tags.map((tagId) => ({
                    leadId: lead.id,
                    tagId: tagId,
                })),
                skipDuplicates: true,
            });
        }
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
                ? leadWithTags.tags.map((lt) => ({
                    id: lt.tag.id,
                    name: lt.tag.name,
                    color: lt.tag.color,
                }))
                : [],
        } : lead;
        try {
            await this.automationService.executeWorkflowsForTrigger(create_workflow_dto_1.WorkflowTrigger.LEAD_CREATED, formattedLead);
        }
        catch (error) {
            console.error('Failed to execute automation for LEAD_CREATED:', error);
        }
        if (dto.assignedTo) {
            try {
                await this.notificationsService.notifyLeadEvent(client_1.NotificationType.LEAD_ASSIGNED, dto.assignedTo, lead.id, `${lead.firstName} ${lead.lastName}`);
            }
            catch (error) {
                console.error('Failed to send notification:', error);
            }
        }
        return { success: true, data: formattedLead };
    }
    async update(id, dto) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!lead)
            return { success: false, message: 'Lead not found' };
        const { tags, ...rest } = dto;
        const updateData = { ...rest, updatedAt: new Date() };
        if (rest.status)
            updateData.status = normalizeLeadStatus(rest.status);
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
        if (Array.isArray(tags)) {
            await this.prisma.leadTag.deleteMany({
                where: { leadId: id },
            });
            if (tags.length > 0) {
                await this.prisma.leadTag.createMany({
                    data: tags.map((tagId) => ({
                        leadId: id,
                        tagId: tagId,
                    })),
                    skipDuplicates: true,
                });
            }
        }
        try {
            const changes = [];
            let activityType = 'LEAD_UPDATED';
            let title = 'Lead updated';
            let icon = 'Edit';
            let iconColor = '#6B7280';
            if (rest.status && lead.status !== updated.status) {
                activityType = 'LEAD_STATUS_CHANGED';
                title = 'Status changed';
                icon = 'TrendingUp';
                iconColor = '#10B981';
                changes.push(`Status: ${String(lead.status).toLowerCase()} → ${String(updated.status).toLowerCase()}`);
            }
            if (rest.priority && lead.priority !== updated.priority) {
                if (activityType === 'LEAD_UPDATED') {
                    title = 'Priority changed';
                    icon = 'Flag';
                    iconColor = '#F59E0B';
                }
                changes.push(`Priority: ${String(lead.priority).toLowerCase()} → ${String(updated.priority).toLowerCase()}`);
            }
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
                }
                else {
                    changes.push('Unassigned');
                }
            }
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
                    type: activityType,
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
                    },
                    userId: lead.assignedTo || 1,
                    leadId: id,
                },
            });
        }
        catch (error) {
            console.error('Error creating lead update activity:', error);
        }
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
                ? updatedWithTags.tags.map((lt) => ({
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
        };
        try {
            await this.automationService.executeWorkflowsForTrigger(create_workflow_dto_1.WorkflowTrigger.LEAD_UPDATED, { ...normalized, previousStatus: lead.status });
            if (rest.status && lead.status !== updated.status) {
                await this.automationService.executeWorkflowsForTrigger(create_workflow_dto_1.WorkflowTrigger.LEAD_STATUS_CHANGED, { ...normalized, oldStatus: lead.status, newStatus: updated.status });
            }
            if (rest.assignedTo !== undefined && lead.assignedTo !== updated.assignedTo) {
                await this.automationService.executeWorkflowsForTrigger(create_workflow_dto_1.WorkflowTrigger.LEAD_ASSIGNED, { ...normalized, oldAssignedTo: lead.assignedTo, newAssignedTo: updated.assignedTo });
                if (updated.assignedTo) {
                    await this.notificationsService.notifyLeadEvent(client_1.NotificationType.LEAD_ASSIGNED, updated.assignedTo, lead.id, `${lead.firstName} ${lead.lastName}`);
                }
            }
        }
        catch (error) {
            console.error('Failed to execute automation for lead update:', error);
        }
        if (rest.status && lead.status !== updated.status && updated.assignedTo) {
            try {
                await this.notificationsService.notifyLeadEvent(client_1.NotificationType.LEAD_STATUS_CHANGED, updated.assignedTo, lead.id, `${lead.firstName} ${lead.lastName}`, String(updated.status).toLowerCase());
            }
            catch (error) {
                console.error('Failed to send status change notification:', error);
            }
        }
        return { success: true, data: { lead: normalized } };
    }
    async remove(id) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!lead)
            return { success: false, message: 'Lead not found' };
        await this.prisma.lead.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Lead moved to trash' };
    }
    async transfer(id, dto) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!lead)
            return { success: false, message: 'Lead not found' };
        const updated = await this.prisma.lead.update({
            where: { id },
            data: {
                assignedTo: dto.newUserId ?? null,
                updatedAt: new Date(),
            },
        });
        return { success: true, message: 'Lead transferred', data: updated };
    }
    async bulkAssign(dto) {
        await this.prisma.lead.updateMany({
            where: { id: { in: dto.leadIds } },
            data: { assignedTo: dto.newUserId ?? null },
        });
        return { success: true, message: 'Leads assigned' };
    }
    async convert(id, dto) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!lead)
            return { success: false, message: 'Lead not found' };
        if (lead.status === 'CONVERTED')
            return { success: false, message: 'Lead is already converted' };
        const result = await this.prisma.$transaction(async (tx) => {
            let createdCompany = null;
            let createdDeal = null;
            if (dto.createCompany && dto.companyData?.name) {
                const existingCompany = await tx.companies.findFirst({
                    where: { name: dto.companyData.name },
                });
                if (existingCompany) {
                    createdCompany = existingCompany;
                }
                else {
                    createdCompany = await tx.companies.create({
                        data: {
                            name: dto.companyData.name,
                            domain: dto.companyData.domain,
                            slug: dto.companyData.slug ||
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
                createdDeal = await tx.deal.create({
                    data: {
                        title,
                        description: dto.dealData?.description,
                        value: (dto.dealData?.value ?? lead.budget ?? 0),
                        currency: dto.dealData?.currency || lead.currency || 'USD',
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
            const updatedLead = await tx.lead.update({
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
    async undoLeadConversion(id) {
        const lead = await this.prisma.lead.findFirst({
            where: {
                id,
                deletedAt: null,
                convertedToDealId: { not: null },
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
    async restore(id) {
        const lead = await this.prisma.lead.findFirst({
            where: { id, deletedAt: { not: null } },
        });
        if (!lead)
            return { success: false, message: 'Lead not found in trash' };
        await this.prisma.lead.update({
            where: { id },
            data: { deletedAt: null },
        });
        return { success: true, message: 'Lead restored successfully' };
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        automation_service_1.AutomationService,
        notifications_service_1.NotificationsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map