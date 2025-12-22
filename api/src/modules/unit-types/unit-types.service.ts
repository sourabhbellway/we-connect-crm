import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';

@Injectable()
export class UnitTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitTypeDto: CreateUnitTypeDto) {
    // Check for duplicate name
    const existing = await this.prisma.unitType.findFirst({
      where: { name: createUnitTypeDto.name },
    });

    if (existing) {
      throw new ConflictException('Unit type with this name already exists');
    }

    return this.prisma.unitType.create({
      data: createUnitTypeDto,
    });
  }

  async findAll() {
    return this.prisma.unitType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const unitType = await this.prisma.unitType.findUnique({
      where: { id },
    });

    if (!unitType) {
      throw new NotFoundException('Unit type not found');
    }

    return unitType;
  }

  async update(id: number, updateUnitTypeDto: UpdateUnitTypeDto) {
    // Check if unit type exists
    await this.findOne(id);

    // Check for duplicate name if name is being updated
    if (updateUnitTypeDto.name) {
      const existing = await this.prisma.unitType.findFirst({
        where: {
          name: updateUnitTypeDto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Unit type with this name already exists');
      }
    }

    return this.prisma.unitType.update({
      where: { id },
      data: updateUnitTypeDto,
    });
  }

  async remove(id: number) {
    // Check if unit type exists
    await this.findOne(id);

    // Check if unit type is being used by any products
    const productsUsingUnitType = await this.prisma.product.findFirst({
      where: { unit: { equals: id.toString() } },
    });

    if (productsUsingUnitType) {
      throw new ConflictException('Cannot delete unit type as it is being used by products');
    }

    return this.prisma.unitType.delete({
      where: { id },
    });
  }

  async toggleActive(id: number) {
    const unitType = await this.findOne(id);

    return this.prisma.unitType.update({
      where: { id },
      data: { isActive: !unitType.isActive },
    });
  }
}