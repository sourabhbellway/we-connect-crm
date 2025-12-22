import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) { }

  async list({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }, user?: any) {
    const where: any = {};

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
      if (Object.keys(roleBasedWhere).length > 0) {
        where.AND = [roleBasedWhere];
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      const searchConditions = [
        { name: { contains: q, mode: 'insensitive' } },
        { domain: { contains: q, mode: 'insensitive' } },
      ];

      if (where.OR) {
        // If there are existing OR conditions (from role-based filtering), combine them
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR; // Remove the original OR as it's now part of AND
      } else {
        // If no existing OR conditions, just apply search OR
        where.OR = searchConditions;
      }
    }

    const rows = await this.prisma.companies.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        industry: true,
      },
    });
    return { success: true, data: rows };
  }

  async getById(id: number, user?: any) {
    const where: any = { id, deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
      if (Object.keys(roleBasedWhere).length > 0) {
        where.AND = [roleBasedWhere];
      }
    }

    const company = await this.prisma.companies.findFirst({
      where,
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        industry: true,
      },
    });
    if (!company) return { success: false, message: 'Company not found' };
    return { success: true, data: { company } };
  }

  async create(dto: CreateCompanyDto, userId?: number) {
    const company = await this.prisma.companies.create({
      data: {
        name: dto.name,
        domain: dto.domain,
        slug: dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        industryId: dto.industryId ?? null,
        assignedTo: userId || null, // <--- Auto-assign to creator
        createdBy: userId || null, // <--- Save creator ID
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
