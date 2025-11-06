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
const client_1 = require("@prisma/client");
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
        return client_1.LeadStatus.NEW;
    const up = status.toUpperCase();
    return client_1.LeadStatus[up] ?? client_1.LeadStatus.NEW;
}
function normalizeLeadPriority(priority) {
    if (!priority)
        return client_1.LeadPriority.MEDIUM;
    const up = priority.toUpperCase();
    return client_1.LeadPriority[up] ?? client_1.LeadPriority.MEDIUM;
}
function toEnumStatus(status) {
    if (!status)
        return client_1.DealStatus.DRAFT;
    const up = status.toUpperCase();
    return client_1.DealStatus[up] ?? client_1.DealStatus.DRAFT;
}
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                if (client_1.LeadStatus[up])
                    where.status = client_1.LeadStatus[up];
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
            const leads = rows.map((r) => ({
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
        return { success: true, data: lead };
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
        try {
            const activityType = rest.status && lead.status !== updated.status
                ? 'LEAD_STATUS_CHANGED'
                : rest.assignedTo && lead.assignedTo !== updated.assignedTo
                    ? 'LEAD_ASSIGNED'
                    : 'LEAD_UPDATED';
            let description = 'Lead updated';
            if (rest.status && lead.status !== updated.status) {
                description = `Lead status changed from ${lead.status} to ${updated.status}`;
            }
            else if (rest.priority && lead.priority !== updated.priority) {
                description = `Lead priority changed to ${updated.priority}`;
            }
            else if (rest.assignedTo && lead.assignedTo !== updated.assignedTo) {
                description = 'Lead assigned to user';
            }
            await this.prisma.activity.create({
                data: {
                    title: activityType === 'LEAD_STATUS_CHANGED' ? 'Status changed' : activityType === 'LEAD_ASSIGNED' ? 'Lead assigned' : 'Lead updated',
                    description,
                    type: activityType,
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
                    },
                    userId: lead.assignedTo || 1,
                    leadId: id,
                },
            });
        }
        catch (error) {
            console.error('Error creating lead update activity:', error);
        }
        const normalized = {
            ...updated,
            status: String(updated.status || '').toLowerCase(),
            priority: updated.priority
                ? String(updated.priority).toLowerCase()
                : undefined,
        };
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map