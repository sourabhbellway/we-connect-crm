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
    update(id: number, dto: UpsertIndustryDto): Promise<{
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
    remove(id: number): Promise<{
        success: boolean;
    }>;
    addField(industryId: number, dto: UpsertIndustryFieldDto): Promise<{
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
    updateField(fieldId: number, dto: UpsertIndustryFieldDto): Promise<{
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
    removeField(fieldId: number): Promise<{
        success: boolean;
    }>;
}
