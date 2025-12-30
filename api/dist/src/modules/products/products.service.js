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
        try {
            if (!dto.name || !dto.name.trim()) {
                return { success: false, message: 'Product name is required' };
            }
            if (dto.price === undefined || dto.price === null || isNaN(Number(dto.price))) {
                return { success: false, message: 'Valid price is required' };
            }
            if (dto.sku && dto.sku.trim()) {
                const existingProduct = await this.prisma.product.findFirst({
                    where: {
                        sku: dto.sku.trim(),
                        deletedAt: null
                    },
                });
                if (existingProduct) {
                    return { success: false, message: 'SKU already exists. Please use a different SKU.' };
                }
            }
            const validTypes = ['PHYSICAL', 'DIGITAL', 'SERVICE'];
            let productType = 'PHYSICAL';
            if (dto.type) {
                const upperType = String(dto.type).toUpperCase();
                productType = validTypes.includes(upperType) ? upperType : 'PHYSICAL';
            }
            const product = await this.prisma.product.create({
                data: {
                    name: dto.name.trim(),
                    description: dto.description && dto.description.trim() ? dto.description.trim() : null,
                    sku: dto.sku && String(dto.sku).trim() !== '' ? dto.sku.trim() : null,
                    type: productType,
                    category: dto.category && String(dto.category).trim() !== '' ? dto.category.trim() : null,
                    price: Number(dto.price),
                    cost: dto.cost !== undefined && dto.cost !== null ? Number(dto.cost) : null,
                    currency: dto.currency ?? 'USD',
                    unit: dto.unit ?? 'pcs',
                    taxRate: dto.taxRate !== undefined && dto.taxRate !== null ? Number(dto.taxRate) : null,
                    hsnCode: dto.hsnCode && String(dto.hsnCode).trim() !== '' ? dto.hsnCode.trim() : null,
                    stockQuantity: dto.stockQuantity ?? 0,
                    minStockLevel: dto.minStockLevel ?? 0,
                    maxStockLevel: dto.maxStockLevel ?? 0,
                    image: dto.image && String(dto.image).trim() !== '' ? dto.image.trim() : null,
                    isActive: dto.isActive ?? true,
                },
            });
            return { success: true, message: 'Product created', data: { product } };
        }
        catch (error) {
            console.error('Error creating product:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                meta: error.meta,
                stack: error.stack,
            });
            if (error.code === 'P2002') {
                return { success: false, message: 'SKU already exists. Please use a different SKU.' };
            }
            if (error.code === 'P2003') {
                return { success: false, message: 'Invalid reference. Please check all field values.' };
            }
            return {
                success: false,
                message: error.message || 'Failed to create product. Please check all required fields.'
            };
        }
    }
    async update(id, dto) {
        try {
            const existingProduct = await this.prisma.product.findFirst({
                where: { id, deletedAt: null },
            });
            if (!existingProduct) {
                return { success: false, message: 'Product not found' };
            }
            if (dto.price !== undefined && (dto.price === null || isNaN(Number(dto.price)))) {
                return { success: false, message: 'Valid price is required' };
            }
            if (dto.sku && dto.sku.trim() && dto.sku.trim() !== existingProduct.sku) {
                const duplicateProduct = await this.prisma.product.findFirst({
                    where: {
                        sku: dto.sku.trim(),
                        deletedAt: null,
                        id: { not: id }
                    },
                });
                if (duplicateProduct) {
                    return { success: false, message: 'SKU already exists. Please use a different SKU.' };
                }
            }
            const updateData = {};
            if (dto.name !== undefined)
                updateData.name = dto.name.trim();
            if (dto.description !== undefined) {
                updateData.description = dto.description && dto.description.trim() ? dto.description.trim() : null;
            }
            if (dto.sku !== undefined) {
                updateData.sku = dto.sku && String(dto.sku).trim() !== '' ? dto.sku.trim() : null;
            }
            if (dto.type !== undefined) {
                const validTypes = ['PHYSICAL', 'DIGITAL', 'SERVICE'];
                updateData.type = validTypes.includes(String(dto.type).toUpperCase())
                    ? String(dto.type).toUpperCase()
                    : 'PHYSICAL';
            }
            if (dto.category !== undefined) {
                updateData.category = dto.category && String(dto.category).trim() !== '' ? dto.category.trim() : null;
            }
            if (dto.price !== undefined)
                updateData.price = Number(dto.price);
            if (dto.cost !== undefined) {
                updateData.cost = dto.cost !== null ? Number(dto.cost) : null;
            }
            if (dto.currency !== undefined)
                updateData.currency = dto.currency;
            if (dto.unit !== undefined)
                updateData.unit = dto.unit;
            if (dto.taxRate !== undefined) {
                updateData.taxRate = dto.taxRate !== null ? Number(dto.taxRate) : null;
            }
            if (dto.hsnCode !== undefined) {
                updateData.hsnCode = dto.hsnCode && String(dto.hsnCode).trim() !== '' ? dto.hsnCode.trim() : null;
            }
            if (dto.stockQuantity !== undefined)
                updateData.stockQuantity = dto.stockQuantity;
            if (dto.minStockLevel !== undefined)
                updateData.minStockLevel = dto.minStockLevel;
            if (dto.maxStockLevel !== undefined)
                updateData.maxStockLevel = dto.maxStockLevel;
            if (dto.image !== undefined) {
                updateData.image = dto.image && String(dto.image).trim() !== '' ? dto.image.trim() : null;
            }
            if (dto.isActive !== undefined)
                updateData.isActive = dto.isActive;
            updateData.updatedAt = new Date();
            const product = await this.prisma.product.update({
                where: { id },
                data: updateData,
            });
            return { success: true, message: 'Product updated', data: { product } };
        }
        catch (error) {
            console.error('Error updating product:', error);
            if (error.code === 'P2002') {
                return { success: false, message: 'SKU already exists. Please use a different SKU.' };
            }
            if (error.code === 'P2025') {
                return { success: false, message: 'Product not found' };
            }
            return {
                success: false,
                message: error.message || 'Failed to update product. Please check all fields.'
            };
        }
    }
    async remove(id) {
        await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true, message: 'Product deleted' };
    }
    async bulkExport(opts = {}) {
        const where = { deletedAt: null };
        if (opts.search) {
            const q = opts.search.trim();
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
            ];
        }
        const products = await this.prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        const headers = [
            'name',
            'sku',
            'type',
            'category',
            'price',
            'cost',
            'currency',
            'unit',
            'taxRate',
            'stockQuantity',
            'minStockLevel',
            'isActive',
        ];
        const rows = [headers.join(',')];
        for (const p of products) {
            const row = [
                escapeCsv(p.name),
                escapeCsv(p.sku || ''),
                escapeCsv(p.type),
                escapeCsv(p.category || ''),
                escapeCsv(Number(p.price)),
                escapeCsv(p.cost ? Number(p.cost) : ''),
                escapeCsv(p.currency),
                escapeCsv(p.unit || ''),
                escapeCsv(p.taxRate ? Number(p.taxRate) : ''),
                escapeCsv(p.stockQuantity || 0),
                escapeCsv(p.minStockLevel || 0),
                escapeCsv(p.isActive ? 'YES' : 'NO'),
            ];
            rows.push(row.join(','));
        }
        return rows.join('\r\n');
    }
    async bulkImportFromCsv(file) {
        try {
            if (!file || !file.buffer) {
                return { success: false, message: 'Invalid file' };
            }
            const csvContent = file.buffer.toString('utf-8');
            const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length < 2) {
                return { success: false, message: 'CSV file must contain headers and at least one row of data' };
            }
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const requiredFields = ['name', 'price'];
            const missingFields = requiredFields.filter(f => !headers.includes(f));
            if (missingFields.length > 0) {
                return { success: false, message: `CSV must contain these columns: ${missingFields.join(', ')}` };
            }
            const results = {
                imported: 0,
                failed: 0,
                errors: [],
            };
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split(',').map(v => v.trim());
                    const row = {};
                    headers.forEach((h, idx) => (row[h] = values[idx] || ''));
                    if (!row.name || !row.price) {
                        results.errors.push({ row: i + 1, error: 'Missing name or price' });
                        results.failed++;
                        continue;
                    }
                    if (row.sku) {
                        const existing = await this.prisma.product.findFirst({
                            where: { sku: row.sku, deletedAt: null },
                        });
                        if (existing) {
                            results.errors.push({ row: i + 1, error: `SKU "${row.sku}" already exists` });
                            results.failed++;
                            continue;
                        }
                    }
                    await this.create({
                        name: row.name,
                        sku: row.sku || undefined,
                        price: parseFloat(row.price),
                        description: row.description || undefined,
                        category: row.category || undefined,
                        type: row.type?.toUpperCase() || 'PHYSICAL',
                        cost: row.cost ? parseFloat(row.cost) : undefined,
                        currency: row.currency || 'USD',
                        unit: row.unit || 'pcs',
                        taxRate: row.taxrate ? parseFloat(row.taxrate) : undefined,
                        stockQuantity: row.stockquantity ? parseInt(row.stockquantity) : 0,
                        minStockLevel: row.minstocklevel ? parseInt(row.minstocklevel) : 0,
                        isActive: row.isactive?.toUpperCase() === 'YES' || row.isactive?.toUpperCase() === 'TRUE',
                    });
                    results.imported++;
                }
                catch (err) {
                    results.errors.push({ row: i + 1, error: err.message });
                    results.failed++;
                }
            }
            return {
                success: true,
                message: `Import completed. Imported: ${results.imported}, Failed: ${results.failed}`,
                data: results,
            };
        }
        catch (error) {
            return { success: false, message: error.message || 'Failed to import products' };
        }
    }
    async bulkDelete(ids) {
        await this.prisma.product.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true, message: 'Products deleted successfully' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
function escapeCsv(val) {
    if (val === null || val === undefined)
        return '""';
    let s = String(val);
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
        s = s.replace(/"/g, '""');
        return `"${s}"`;
    }
    return s;
}
//# sourceMappingURL=products.service.js.map