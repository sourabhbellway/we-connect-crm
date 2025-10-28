import { LeadSourcesService } from './lead-sources.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';
export declare class LeadSourcesController {
    private readonly service;
    constructor(service: LeadSourcesService);
    list(): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        }[];
    }>;
    create(dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        };
    }>;
    update(id: string, dto: UpsertLeadSourceDto): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
