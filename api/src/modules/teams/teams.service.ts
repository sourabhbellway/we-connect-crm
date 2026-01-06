import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) { }

  async create(createTeamDto: CreateTeamDto) {
    console.log('Creating team with DTO:', JSON.stringify(createTeamDto, null, 2));
    const { memberIds, ...rest } = createTeamDto;

    // Filter out manager from members if they are in the list
    const filteredMemberIds = memberIds?.filter(id => id !== rest.managerId);

    const result = await (this.prisma.team as any).create({
      data: {
        ...rest,
        members: filteredMemberIds && filteredMemberIds.length > 0 ? {
          connect: filteredMemberIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        manager: true,
        members: true,
        product: true,
      },
    });
    console.log('Created team result:', JSON.stringify(result, null, 2));
    return result;
  }

  async findAll() {
    const result = await (this.prisma.team as any).findMany({
      include: {
        manager: true,
        members: true, // Include members for listing and view
        product: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('All teams found:', JSON.stringify(result, null, 2));
    return result;
  }

  async findOne(id: number) {
    return (this.prisma.team as any).findUnique({
      where: { id },
      include: {
        manager: true,
        members: true,
        product: true,
      },
    });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    console.log(`Updating team ${id} with DTO:`, JSON.stringify(updateTeamDto, null, 2));
    const { memberIds, ...rest } = updateTeamDto;

    // Filter out manager from members if they are in the list
    const filteredMemberIds = memberIds?.filter(mid => mid !== (rest.managerId || undefined));

    const result = await (this.prisma.team as any).update({
      where: { id },
      data: {
        ...rest,
        members: memberIds ? {
          set: filteredMemberIds?.map((id) => ({ id })) || [],
        } : undefined,
      },
      include: {
        manager: true,
        members: true,
        product: true,
      },
    });
    console.log('Updated team result:', JSON.stringify(result, null, 2));
    return result;
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
