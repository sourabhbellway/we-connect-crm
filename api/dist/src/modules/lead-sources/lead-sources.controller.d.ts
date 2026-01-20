import { LeadSourcesService } from './lead-sources.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';
export declare class LeadSourcesController {
    private readonly service;
    constructor(service: LeadSourcesService);
    list(): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        }[];
    }>;
    create(dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        };
    }>;
    update(id: string, dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            companyId: number | null;
            name: string;
            description: string | null;
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
