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
                    type: import(".prisma/client").$Enums.FieldType;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    isActive: boolean;
                    key: string;
                    isRequired: boolean;
                    industryId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                slug: string;
            })[];
        };
    }>;
    create(dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                slug: string;
            };
        };
    }>;
    update(id: string, dto: UpsertIndustryDto): Promise<{
        success: boolean;
        data: {
            industry: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
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
                type: import(".prisma/client").$Enums.FieldType;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
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
                type: import(".prisma/client").$Enums.FieldType;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
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
