import { TagsService } from './tags.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';
export declare class TagsController {
    private readonly service;
    constructor(service: TagsService);
    list(): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
        }[];
    }>;
    create(dto: UpsertTagDto): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
        };
    }>;
    update(id: string, dto: UpsertTagDto): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
