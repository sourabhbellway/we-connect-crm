import { UnitTypesService } from './unit-types.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';
export declare class UnitTypesController {
    private readonly unitTypesService;
    constructor(unitTypesService: UnitTypesService);
    create(createUnitTypeDto: CreateUnitTypeDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    findAll(): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }[]>;
    findOne(id: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    update(id: number, updateUnitTypeDto: UpdateUnitTypeDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    remove(id: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    toggleActive(id: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
}
