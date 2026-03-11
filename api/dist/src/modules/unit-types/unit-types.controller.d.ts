import { UnitTypesService } from './unit-types.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';
export declare class UnitTypesController {
    private readonly unitTypesService;
    constructor(unitTypesService: UnitTypesService);
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
