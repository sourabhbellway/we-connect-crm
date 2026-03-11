import { PrismaService } from '../../database/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTeamDto: CreateTeamDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateTeamDto: UpdateTeamDto): Promise<any>;
    remove(id: number): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        managerId: number | null;
        productId: number | null;
    }>;
}
