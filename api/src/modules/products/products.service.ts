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
    try {
      // Validate required fields
      if (!dto.name || !dto.name.trim()) {
        return { success: false, message: 'Product name is required' };
      }

      if (dto.price === undefined || dto.price === null || isNaN(Number(dto.price))) {
        return { success: false, message: 'Valid price is required' };
      }

      // Check for duplicate SKU if provided
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

      // Validate and normalize type
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
          type: productType as any,
          category: dto.category && String(dto.category).trim() !== '' ? dto.category.trim() : null,
          price: Number(dto.price) as any,
          cost: dto.cost !== undefined && dto.cost !== null ? Number(dto.cost) as any : null,
          currency: dto.currency ?? 'USD',
          unit: dto.unit ?? 'pcs',
          taxRate: dto.taxRate !== undefined && dto.taxRate !== null ? Number(dto.taxRate) as any : null,
          hsnCode: dto.hsnCode && String(dto.hsnCode).trim() !== '' ? dto.hsnCode.trim() : null,
          stockQuantity: dto.stockQuantity ?? 0,
          minStockLevel: dto.minStockLevel ?? 0,
          maxStockLevel: dto.maxStockLevel ?? 0,
          image: dto.image && String(dto.image).trim() !== '' ? dto.image.trim() : null,
          isActive: dto.isActive ?? true,
        },
      });
      return { success: true, message: 'Product created', data: { product } };
    } catch (error: any) {
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

  async update(id: number, dto: UpdateProductDto) {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existingProduct) {
        return { success: false, message: 'Product not found' };
      }

      // Validate price if provided
      if (dto.price !== undefined && (dto.price === null || isNaN(Number(dto.price)))) {
        return { success: false, message: 'Valid price is required' };
      }

      // Check for duplicate SKU if provided and different from current
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

      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name.trim();
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
      if (dto.price !== undefined) updateData.price = Number(dto.price) as any;
      if (dto.cost !== undefined) {
        updateData.cost = dto.cost !== null ? Number(dto.cost) as any : null;
      }
      if (dto.currency !== undefined) updateData.currency = dto.currency;
      if (dto.unit !== undefined) updateData.unit = dto.unit;
      if (dto.taxRate !== undefined) {
        updateData.taxRate = dto.taxRate !== null ? Number(dto.taxRate) as any : null;
      }
      if (dto.hsnCode !== undefined) {
        updateData.hsnCode = dto.hsnCode && String(dto.hsnCode).trim() !== '' ? dto.hsnCode.trim() : null;
      }
      if (dto.stockQuantity !== undefined) updateData.stockQuantity = dto.stockQuantity;
      if (dto.minStockLevel !== undefined) updateData.minStockLevel = dto.minStockLevel;
      if (dto.maxStockLevel !== undefined) updateData.maxStockLevel = dto.maxStockLevel;
      if (dto.image !== undefined) {
        updateData.image = dto.image && String(dto.image).trim() !== '' ? dto.image.trim() : null;
      }
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
      updateData.updatedAt = new Date();

      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
      });
      return { success: true, message: 'Product updated', data: { product } };
    } catch (error: any) {
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

  async remove(id: number) {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true, message: 'Product deleted' };
  }
}
