import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) { }

  async create(createTeamDto: CreateTeamDto) {
    const { memberIds, ...rest } = createTeamDto;

    return this.prisma.team.create({
      data: {
        ...rest,
        members: memberIds ? {
          connect: memberIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        manager: true,
        members: true,
      },
    });
  }

  async findAll() {
    return this.prisma.team.findMany({
      include: {
        manager: true,
        members: true, // Include members for listing and view
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        manager: true,
        members: true,
      },
    });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const { memberIds, ...rest } = updateTeamDto;

    return this.prisma.team.update({
      where: { id },
      data: {
        ...rest,
        members: memberIds ? {
          set: memberIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        manager: true,
        members: true,
      },
    });
  }

  async remove(id: number) {
    // Optional: Manually disconnect members if relation constraints require it
    // But typically if nullable, we can let Prisma handle it or update users first.
    // Let's explicitly unlink members to be safe and clear.
    await this.prisma.user.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    });

    return this.prisma.team.delete({
      where: { id },
    });
  }
}
