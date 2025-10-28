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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, search, }) {
        const where = { deletedAt: null };
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);
        return { success: true, data: { items, total, page, limit } };
    }
    async getById(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null },
        });
        if (!product)
            return { success: false, message: 'Product not found' };
        return { success: true, data: { product } };
    }
    async create(dto) {
        const product = await this.prisma.product.create({
            data: {
                name: dto.name,
                description: dto.description,
                sku: dto.sku ?? null,
                type: dto.type ?? 'PHYSICAL',
                category: dto.category ?? null,
                price: dto.price,
                cost: dto.cost ?? null,
                currency: dto.currency ?? 'USD',
                unit: dto.unit ?? 'pcs',
                taxRate: dto.taxRate ?? null,
                stockQuantity: dto.stockQuantity ?? 0,
                minStockLevel: dto.minStockLevel ?? 0,
                maxStockLevel: dto.maxStockLevel ?? 0,
                image: dto.image ?? null,
            },
        });
        return { success: true, message: 'Product created', data: { product } };
    }
    async update(id, dto) {
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                sku: dto.sku,
                type: dto.type,
                category: dto.category,
                price: dto.price,
                cost: dto.cost,
                currency: dto.currency,
                unit: dto.unit,
                taxRate: dto.taxRate,
                stockQuantity: dto.stockQuantity,
                minStockLevel: dto.minStockLevel,
                maxStockLevel: dto.maxStockLevel,
                image: dto.image,
                updatedAt: new Date(),
            },
        });
        return { success: true, message: 'Product updated', data: { product } };
    }
    async remove(id) {
        await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true, message: 'Product deleted' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map