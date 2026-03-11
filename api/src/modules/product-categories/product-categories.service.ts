import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
      throw new ConflictException(
        'Product category with this name already exists',
      );
    }

    const category = await this.prisma.productCategory.create({
      data: {
        ...createProductCategoryDto,
        isActive: createProductCategoryDto.isActive ?? true,
      },
    });

    return {
      success: true,
      message: 'Product category created successfully',
      data: { category },
    };
  }

  async findAll() {
    const categories = await this.prisma.productCategory.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    return {
      success: true,
      message: 'Product categories retrieved successfully',
      data: categories,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Product category not found');
    }

    return {
      success: true,
      message: 'Product category retrieved successfully',
      data: { category },
    };
  }

  // Internal helper to get raw entity
  private async getCategoryOrThrow(id: number) {
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
    await this.getCategoryOrThrow(id);

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
        throw new ConflictException(
          'Product category with this name already exists',
        );
      }
    }

    const updatedCategory = await this.prisma.productCategory.update({
      where: { id },
      data: updateProductCategoryDto,
    });

    return {
      success: true,
      message: 'Product category updated successfully',
      data: { category: updatedCategory },
    };
  }

  async remove(id: number) {
    // Check if category exists
    await this.getCategoryOrThrow(id);

    // Check if category is being used by any products
    const productsUsingCategory = await this.prisma.product.findFirst({
      where: { category: { equals: id.toString() } },
    });

    if (productsUsingCategory) {
      throw new ConflictException(
        'Cannot delete category as it is being used by products',
      );
    }

    await this.prisma.productCategory.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Product category deleted successfully',
    };
  }

  async toggleActive(id: number) {
    const category = await this.getCategoryOrThrow(id);

    const updatedCategory = await this.prisma.productCategory.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    return {
      success: true,
      message: 'Product category status updated successfully',
      data: { category: updatedCategory },
    };
  }
}
