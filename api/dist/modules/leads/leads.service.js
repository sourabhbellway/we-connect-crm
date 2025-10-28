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
const toEnumStatus = (s) => (s ? s.toUpperCase() : undefined);
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [total, byStatus] = await Promise.all([
            this.prisma.lead.count({ where: { deletedAt: null } }),
            this.prisma.lead.groupBy({
                by: ['status'],
                _count: { _all: true },
                where: { deletedAt: null },
            }),
        ]);
        const statusMap = {};
        byStatus.forEach((r) => (statusMap[r.status] = r._count._all));
        return { success: true, data: { total, byStatus: statusMap } };
    }
    async list({ page = 1, limit = 10, status, search, }) {
        const where = { deletedAt: null };
        if (status)
            where.status = toEnumStatus(status);
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
    async getById(id) {
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
        if (!lead)
            return { success: false, message: 'Lead not found' };
        return {
            success: true,
            data: { ...lead, tags: lead.tags.map((t) => t.tag) },
        };
    }
    async create(dto) {
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
                budget: dto.budget,
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
    async update(id, dto) {
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
                budget: dto.budget,
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
    async remove(id) {
        await this.prisma.lead.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true, message: 'Lead deleted successfully' };
    }
    async transfer(id, dto) {
        const lead = await this.prisma.lead.update({
            where: { id },
            data: { assignedTo: dto.newUserId ?? null, updatedAt: new Date() },
        });
        return { success: true, message: 'Lead transferred', data: { lead } };
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
            let createdContact = null;
            let createdCompany = null;
            let createdDeal = null;
            if (dto.createContact) {
                const email = dto.contactData?.email || lead.email;
                const existing = await tx.contact.findFirst({
                    where: { email, deletedAt: null },
                });
                if (existing) {
                    createdContact = existing;
                }
                else {
                    createdContact = await tx.contact.create({
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
            if (dto.createDeal && dto.dealData?.title) {
                createdDeal = await tx.deal.create({
                    data: {
                        title: dto.dealData.title,
                        description: dto.dealData.description,
                        value: dto.dealData.value,
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
            const updatedLead = await tx.lead.update({
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
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map