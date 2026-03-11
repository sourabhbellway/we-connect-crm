import { TagsService } from './tags.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';
export declare class TagsController {
    private readonly service;
    constructor(service: TagsService);
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
        }[];
    }>;
    create(dto: UpsertTagDto): Promise<{
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
        };
    }>;
    update(id: string, dto: UpsertTagDto): Promise<{
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
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
