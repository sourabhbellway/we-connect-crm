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
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    type: import("@prisma/client").$Enums.FieldType;
                    key: string;
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
    update(id: string, dto: UpsertIndustryDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
    addField(industryId: string, dto: UpsertIndustryFieldDto): Promise<{
        success: boolean;
        data: {
            field: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
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
