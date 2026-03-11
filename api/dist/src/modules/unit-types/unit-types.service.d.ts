import { PrismaService } from '../../database/prisma.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';
export declare class UnitTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUnitTypeDto: CreateUnitTypeDto): Promise<{
        success: boolean;
        message: string;
        data: {
            unitType: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
        }[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            unitType: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        };
    }>;
    private getUnitTypeOrThrow;
    update(id: number, updateUnitTypeDto: UpdateUnitTypeDto): Promise<{
        success: boolean;
        message: string;
        data: {
            unitType: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleActive(id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            unitType: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        };
    }>;
}
