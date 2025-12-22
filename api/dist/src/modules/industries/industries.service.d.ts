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
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    key: string;
                    type: import("@prisma/client").$Enums.FieldType;
                    isRequired: boolean;
                    industryId: number;
                }[];
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                slug: string;
            })[];
        };
    }>;
    create(dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                slug: string;
            };
        };
    }>;
    update(id: number, dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                key: string;
                type: import("@prisma/client").$Enums.FieldType;
                isRequired: boolean;
                industryId: number;
            };
        };
    }>;
    updateField(fieldId: number, dto: UpsertIndustryFieldDto): Promise<{
        success: boolean;
        data: {
            field: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                key: string;
                type: import("@prisma/client").$Enums.FieldType;
                isRequired: boolean;
                industryId: number;
            };
        };
    }>;
    removeField(fieldId: number): Promise<{
        success: boolean;
    }>;
}
