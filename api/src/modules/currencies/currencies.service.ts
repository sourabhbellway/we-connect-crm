import { Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CurrenciesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createCurrencyDto: CreateCurrencyDto) {
        if (createCurrencyDto.isDefault) {
            return this.prisma.$transaction(async (tx) => {
                await tx.currency.updateMany({
                    where: { isDefault: true },
                    data: { isDefault: false },
                });
                return tx.currency.create({
                    data: createCurrencyDto,
                });
            });
        }
        return this.prisma.currency.create({
            data: createCurrencyDto,
        });
    }

    findAll() {
        return this.prisma.currency.findMany({
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    findOne(id: number) {
        return this.prisma.currency.findUnique({
            where: { id },
        });
    }

    async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
        if (updateCurrencyDto.isDefault) {
            return this.prisma.$transaction(async (tx) => {
                await tx.currency.updateMany({
                    where: { isDefault: true, id: { not: id } },
                    data: { isDefault: false },
                });
                return tx.currency.update({
                    where: { id },
                    data: updateCurrencyDto,
                });
            });
        }

        return this.prisma.currency.update({
            where: { id },
            data: updateCurrencyDto,
        });
    }

    remove(id: number) {
        return this.prisma.currency.delete({
            where: { id },
        });
    }
}
