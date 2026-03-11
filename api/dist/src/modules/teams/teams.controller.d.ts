import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    create(createTeamDto: CreateTeamDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateTeamDto: UpdateTeamDto): Promise<any>;
    remove(id: string): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        managerId: number | null;
        productId: number | null;
    }>;
}
