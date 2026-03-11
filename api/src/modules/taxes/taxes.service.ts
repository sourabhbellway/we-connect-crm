import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaxesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaxDto: CreateTaxDto) {
    const tax = await this.prisma.tax.create({
      data: createTaxDto,
    });
    return {
      success: true,
      message: 'Tax created successfully',
      data: { tax },
    };
  }

  async findAll() {
    const taxes = await this.prisma.tax.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      message: 'Taxes retrieved successfully',
      data: taxes,
    };
  }

  async findOne(id: number) {
    const tax = await this.prisma.tax.findUnique({
      where: { id },
    });
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }
    return {
      success: true,
      message: 'Tax retrieved successfully',
      data: { tax },
    };
  }

  async update(id: number, updateTaxDto: UpdateTaxDto) {
    const tax = await this.prisma.tax.update({
      where: { id },
      data: updateTaxDto,
    });
    return {
      success: true,
      message: 'Tax updated successfully',
      data: { tax },
    };
  }

  async remove(id: number) {
    await this.prisma.tax.delete({
      where: { id },
    });
    return {
      success: true,
      message: 'Tax deleted successfully',
    };
  }
}
