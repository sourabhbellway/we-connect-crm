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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ContactsService = class ContactsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, search, }) {
        const where = { deletedAt: null };
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
    async getById(id) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, deletedAt: null },
        });
        if (!contact)
            return { success: false, message: 'Contact not found' };
        return { success: true, data: { contact } };
    }
    async create(dto) {
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
    async update(id, dto) {
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
    async remove(id) {
        await this.prisma.contact.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true, message: 'Contact deleted successfully' };
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map