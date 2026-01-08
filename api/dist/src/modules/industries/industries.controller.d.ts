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
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    type: import("@prisma/client").$Enums.FieldType;
                    key: string;
                    isRequired: boolean;
                    industryId: number;
                }[];
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
            })[];
        };
    }>;
    create(dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
            };
        };
    }>;
    update(id: string, dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.FieldType;
                key: string;
                isRequired: boolean;
                industryId: number;
            };
        };
    }>;
    updateField(fieldId: string, dto: UpsertIndustryFieldDto): Promise<{
        success: boolean;
        data: {
            field: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.FieldType;
                key: string;
                isRequired: boolean;
                industryId: number;
            };
        };
    }>;
    removeField(fieldId: string): Promise<{
        success: boolean;
    }>;
}
