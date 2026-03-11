import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CurrenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCurrencyDto: CreateCurrencyDto) {
    let currency;
    if (createCurrencyDto.isDefault) {
      currency = await this.prisma.$transaction(async (tx) => {
        await tx.currency.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
        return tx.currency.create({
          data: createCurrencyDto,
        });
      });
    } else {
      currency = await this.prisma.currency.create({
        data: createCurrencyDto,
      });
    }
    return {
      success: true,
      message: 'Currency created successfully',
      data: { currency },
    };
  }

  async findAll() {
    const currencies = await this.prisma.currency.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return {
      success: true,
      message: 'Currencies retrieved successfully',
      data: currencies,
    };
  }

  async findOne(id: number) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    return {
      success: true,
      message: 'Currency retrieved successfully',
      data: { currency },
    };
  }

  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    let currency;
    if (updateCurrencyDto.isDefault) {
      currency = await this.prisma.$transaction(async (tx) => {
        await tx.currency.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
        return tx.currency.update({
          where: { id },
          data: updateCurrencyDto,
        });
      });
    } else {
      currency = await this.prisma.currency.update({
        where: { id },
        data: updateCurrencyDto,
      });
    }

    return {
      success: true,
      message: 'Currency updated successfully',
      data: { currency },
    };
  }

  async remove(id: number) {
    await this.prisma.currency.delete({
      where: { id },
    });
    return {
      success: true,
      message: 'Currency deleted successfully',
    };
  }
}
