import { LeadSourcesService } from './lead-sources.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';
export declare class LeadSourcesController {
    private readonly service;
    constructor(service: LeadSourcesService);
    list(): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        }[];
    }>;
    create(dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        };
    }>;
    update(id: string, dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
