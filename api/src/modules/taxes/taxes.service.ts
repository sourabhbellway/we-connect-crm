import { Injectable } from '@nestjs/common';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaxesService {
  constructor(private readonly prisma: PrismaService) { }

  create(createTaxDto: CreateTaxDto) {
    return this.prisma.tax.create({
      data: createTaxDto,
    });
  }

  findAll() {
    return this.prisma.tax.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.tax.findUnique({
      where: { id },
    });
  }

  update(id: number, updateTaxDto: UpdateTaxDto) {
    return this.prisma.tax.update({
      where: { id },
      data: updateTaxDto,
    });
  }

  remove(id: number) {
    return this.prisma.tax.delete({
      where: { id },
    });
  }
}
