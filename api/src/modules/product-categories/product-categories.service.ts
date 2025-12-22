import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createProductCategoryDto: CreateProductCategoryDto) {
    // Check if category with same name already exists
    const existingCategory = await this.prisma.productCategory.findFirst({
      where: {
        name: {
          equals: createProductCategoryDto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException('Product category with this name already exists');
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

  async findOne(id: number) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Product category not found');
    }

    return category;
  }

  async update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
    // Check if category exists
    await this.findOne(id);

    // Check if name is being updated and if it conflicts with existing category
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
        throw new ConflictException('Product category with this name already exists');
      }
    }

    return this.prisma.productCategory.update({
      where: { id },
      data: updateProductCategoryDto,
    });
  }

  async remove(id: number) {
    // Check if category exists
    await this.findOne(id);

    // Check if category is being used by any products
    const productsUsingCategory = await this.prisma.product.findFirst({
      where: { category: { equals: id.toString() } },
    });

    if (productsUsingCategory) {
      throw new ConflictException('Cannot delete category as it is being used by products');
    }

    return this.prisma.productCategory.delete({
      where: { id },
    });
  }

  async toggleActive(id: number) {
    const category = await this.findOne(id);

    return this.prisma.productCategory.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
  }
}