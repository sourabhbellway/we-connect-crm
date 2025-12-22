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
exports.ProductCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ProductCategoriesService = class ProductCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductCategoryDto) {
        const existingCategory = await this.prisma.productCategory.findFirst({
            where: {
                name: {
                    equals: createProductCategoryDto.name,
                    mode: 'insensitive',
                },
            },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Product category with this name already exists');
        }
        return this.prisma.productCategory.create({
            data: {
                ...createProductCategoryDto,
                isActive: createProductCategoryDto.isActive ?? true,
            },
        });
    }
    async findAll() {
        return this.prisma.productCategory.findMany({
            orderBy: [
                { isActive: 'desc' },
                { name: 'asc' },
            ],
        });
    }
    async findOne(id) {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Product category not found');
        }
        return category;
    }
    async update(id, updateProductCategoryDto) {
        await this.findOne(id);
        if (updateProductCategoryDto.name) {
            const existingCategory = await this.prisma.productCategory.findFirst({
                where: {
                    name: {
                        equals: updateProductCategoryDto.name,
                        mode: 'insensitive',
                    },
                    id: {
                        not: id,
                    },
                },
            });
            if (existingCategory) {
                throw new common_1.ConflictException('Product category with this name already exists');
            }
        }
        return this.prisma.productCategory.update({
            where: { id },
            data: updateProductCategoryDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const productsUsingCategory = await this.prisma.product.findFirst({
            where: { category: { equals: id.toString() } },
        });
        if (productsUsingCategory) {
            throw new common_1.ConflictException('Cannot delete category as it is being used by products');
        }
        return this.prisma.productCategory.delete({
            where: { id },
        });
    }
    async toggleActive(id) {
        const category = await this.findOne(id);
        return this.prisma.productCategory.update({
            where: { id },
            data: { isActive: !category.isActive },
        });
    }
};
exports.ProductCategoriesService = ProductCategoriesService;
exports.ProductCategoriesService = ProductCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductCategoriesService);
//# sourceMappingURL=product-categories.service.js.map