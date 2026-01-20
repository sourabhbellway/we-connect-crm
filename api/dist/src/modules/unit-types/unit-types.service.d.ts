import { PrismaService } from '../../database/prisma.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';
export declare class UnitTypesService {
    private prisma;
    constructor(prisma: PrismaService);
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
