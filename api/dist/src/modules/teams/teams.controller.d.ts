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
        createdAt: Date;
        updatedAt: Date;
        id: number;
        managerId: number | null;
        name: string;
        description: string | null;
        productId: number | null;
    }>;
}
