import { IndustriesService } from './industries.service';
import { UpsertIndustryDto } from './dto/upsert-industry.dto';
import { UpsertIndustryFieldDto } from './dto/upsert-industry-field.dto';
export declare class IndustriesController {
    private readonly service;
    constructor(service: IndustriesService);
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
    update(id: string, dto: UpsertIndustryDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
    addField(industryId: string, dto: UpsertIndustryFieldDto): Promise<{
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
    updateField(fieldId: string, dto: UpsertIndustryFieldDto): Promise<{
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
    removeField(fieldId: string): Promise<{
        success: boolean;
    }>;
}
