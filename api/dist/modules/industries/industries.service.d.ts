import { PrismaService } from '../../database/prisma.service';
import { UpsertIndustryDto } from './dto/upsert-industry.dto';
import { UpsertIndustryFieldDto } from './dto/upsert-industry-field.dto';
export declare class IndustriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        success: boolean;
        data: {
            industries: ({
                fields: {
                    name: string;
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    industryId: number;
                    key: string;
                    type: import("@prisma/client").$Enums.FieldType;
                    isRequired: boolean;
                }[];
            } & {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
            })[];
        };
    }>;
    create(dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
            };
        };
    }>;
    update(id: number, dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    addField(industryId: number, dto: UpsertIndustryFieldDto): Promise<{
        success: boolean;
        data: {
            field: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                industryId: number;
                key: string;
                type: import("@prisma/client").$Enums.FieldType;
                isRequired: boolean;
            };
        };
    }>;
    updateField(fieldId: number, dto: UpsertIndustryFieldDto): Promise<{
        success: boolean;
        data: {
            field: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                industryId: number;
                key: string;
                type: import("@prisma/client").$Enums.FieldType;
                isRequired: boolean;
            };
        };
    }>;
    removeField(fieldId: number): Promise<{
        success: boolean;
    }>;
}
