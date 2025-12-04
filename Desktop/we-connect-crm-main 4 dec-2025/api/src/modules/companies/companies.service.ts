import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
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
    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { domain: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.companies.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const company = await this.prisma.companies.findUnique({ where: { id } });
    if (!company) return { success: false, message: 'Company not found' };
    return { success: true, data: { company } };
  }

  async create(dto: CreateCompanyDto) {
    const company = await this.prisma.companies.create({
      data: {
        name: dto.name,
        domain: dto.domain,
        slug: dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        industryId: dto.industryId ?? null,
      },
    });
    return {
      success: true,
      message: 'Company created successfully',
      data: { company },
    };
  }

  async update(id: number, dto: UpdateCompanyDto) {
    const company = await this.prisma.companies.update({
      where: { id },
      data: {
        name: dto.name,
        domain: dto.domain,
        slug: dto.slug,
        industryId: dto.industryId ?? undefined,
        updatedAt: new Date(),
      },
    });
    return {
      success: true,
      message: 'Company updated successfully',
      data: { company },
    };
  }

  async remove(id: number) {
    await this.prisma.companies.delete({ where: { id } });
    return { success: true, message: 'Company deleted successfully' };
  }
}
