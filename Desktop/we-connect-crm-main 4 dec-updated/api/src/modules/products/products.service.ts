import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const where: any = { deletedAt: null };
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

  async getById(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) return { success: false, message: 'Product not found' };
    return { success: true, data: { product } };
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        sku: dto.sku ?? null,
        type: (dto.type as any) ?? 'PHYSICAL',
        category: dto.category ?? null,
        price: dto.price as any,
        cost: (dto.cost as any) ?? null,
        currency: dto.currency ?? 'USD',
        unit: dto.unit ?? 'pcs',
        taxRate: (dto.taxRate as any) ?? null,
        stockQuantity: dto.stockQuantity ?? 0,
        minStockLevel: dto.minStockLevel ?? 0,
        maxStockLevel: dto.maxStockLevel ?? 0,
        image: dto.image ?? null,
      },
    });
    return { success: true, message: 'Product created', data: { product } };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        type: dto.type as any,
        category: dto.category,
        price: dto.price as any,
        cost: dto.cost as any,
        currency: dto.currency,
        unit: dto.unit,
        taxRate: dto.taxRate as any,
        stockQuantity: dto.stockQuantity,
        minStockLevel: dto.minStockLevel,
        maxStockLevel: dto.maxStockLevel,
        image: dto.image,
        updatedAt: new Date(),
      },
    });
    return { success: true, message: 'Product updated', data: { product } };
  }

  async remove(id: number) {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true, message: 'Product deleted' };
  }
}
