import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async list({
    page = 1,
    limit = 10,
    search,
    status,
    category,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) {
    const where: any = { deletedAt: null };

    if (status) {
      where.isActive = status === 'active';
    }

    if (category) {
      where.category = category;
    }
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

  async bulkExport(opts: { search?: string } = {}) {
    const where: any = { deletedAt: null };

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

  async bulkImportFromCsv(file: Express.Multer.File) {
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
        errors: [] as { row: number; error: string }[],
      };

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => (row[h] = values[idx] || ''));

          if (!row.name || !row.price) {
            results.errors.push({ row: i + 1, error: 'Missing name or price' });
            results.failed++;
            continue;
          }

          // Check if SKU exists
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
            type: (row.type?.toUpperCase() as any) || 'PHYSICAL',
            cost: row.cost ? parseFloat(row.cost) : undefined,
            currency: row.currency || 'USD',
            unit: row.unit || 'pcs',
            taxRate: row.taxrate ? parseFloat(row.taxrate) : undefined,
            stockQuantity: row.stockquantity ? parseInt(row.stockquantity) : 0,
            minStockLevel: row.minstocklevel ? parseInt(row.minstocklevel) : 0,
            isActive: row.isactive?.toUpperCase() === 'YES' || row.isactive?.toUpperCase() === 'TRUE',
          } as any);

          results.imported++;
        } catch (err: any) {
          results.errors.push({ row: i + 1, error: err.message });
          results.failed++;
        }
      }

      return {
        success: true,
        message: `Import completed. Imported: ${results.imported}, Failed: ${results.failed}`,
        data: results,
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to import products' };
    }
  }

  async bulkDelete(ids: number[]) {
    await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true, message: 'Products deleted successfully' };
  }
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  let s = String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    s = s.replace(/"/g, '""');
    return `"${s}"`;
  }
  return s;
}

