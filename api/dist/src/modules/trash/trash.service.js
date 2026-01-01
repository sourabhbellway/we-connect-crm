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
var TrashService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrashService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TrashService = TrashService_1 = class TrashService {
    prisma;
    logger = new common_1.Logger(TrashService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll({ page = 1, limit = 10, type = 'all', search = '', }) {
        const skip = (page - 1) * limit;
        const take = Number(limit);
        const results = [];
        let totalItems = 0;
        const types = type === 'all' ? ['user', 'quotation', 'invoice', 'product', 'lead'] : [type];
        for (const t of types) {
            const where = { deletedAt: { not: null } };
            if (search) {
                if (t === 'user' || t === 'lead') {
                    where.OR = [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ];
                }
                else if (t === 'product') {
                    where.OR = [
                        { name: { contains: search, mode: 'insensitive' } },
                        { sku: { contains: search, mode: 'insensitive' } },
                    ];
                }
                else if (t === 'quotation') {
                    where.OR = [
                        { title: { contains: search, mode: 'insensitive' } },
                        { quotationNumber: { contains: search, mode: 'insensitive' } },
                    ];
                }
                else if (t === 'invoice') {
                    where.OR = [
                        { title: { contains: search, mode: 'insensitive' } },
                        { invoiceNumber: { contains: search, mode: 'insensitive' } },
                    ];
                }
            }
            const [items, count] = await Promise.all([
                this.prisma[t].findMany({
                    where,
                    orderBy: { deletedAt: 'desc' },
                }),
                this.prisma[t].count({ where }),
            ]);
            const mappedItems = items.map((item) => ({
                id: item.id,
                name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.title || item.quotationNumber || item.invoiceNumber || 'Unnamed',
                type: t,
                deletedAt: item.deletedAt,
                identifier: item.email || item.sku || item.quotationNumber || item.invoiceNumber || '',
            }));
            results.push(...mappedItems);
            totalItems += count;
        }
        if (types.length > 1) {
            results.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
        }
        const paginatedResults = results.slice(skip, skip + take);
        return {
            success: true,
            data: {
                items: paginatedResults,
                pagination: {
                    totalItems,
                    currentPage: page,
                    pageSize: limit,
                    totalPages: Math.ceil(totalItems / limit),
                },
            },
        };
    }
    async restore(type, id) {
        if (!['user', 'quotation', 'invoice', 'product', 'lead'].includes(type)) {
            throw new common_1.NotFoundException('Invalid entity type');
        }
        await this.prisma[type].update({
            where: { id },
            data: { deletedAt: null },
        });
        return { success: true, message: `${type} restored successfully` };
    }
    async permanentDelete(type, id) {
        if (!['user', 'quotation', 'invoice', 'product', 'lead'].includes(type)) {
            throw new common_1.NotFoundException('Invalid entity type');
        }
        await this.prisma[type].delete({
            where: { id },
        });
        return { success: true, message: `${type} permanently deleted` };
    }
    async emptyTrash(type) {
        const types = type === 'all' ? ['user', 'quotation', 'invoice', 'product', 'lead'] : [type];
        for (const t of types) {
            await this.prisma[t].deleteMany({
                where: { deletedAt: { not: null } },
            });
        }
        return { success: true, message: 'Trash emptied successfully' };
    }
    async getStats() {
        const types = ['user', 'quotation', 'invoice', 'product', 'lead'];
        const stats = {};
        for (const t of types) {
            stats[t] = await this.prisma[t].count({
                where: { deletedAt: { not: null } }
            });
        }
        return {
            success: true,
            data: stats
        };
    }
};
exports.TrashService = TrashService;
exports.TrashService = TrashService = TrashService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrashService);
//# sourceMappingURL=trash.service.js.map