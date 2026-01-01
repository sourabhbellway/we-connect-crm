import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private readonly service;
    constructor(service: NotesService);
    list(leadId: string, user?: any): Promise<{
        success: boolean;
        data: {
            notes: ({
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                title: string;
                leadId: number;
                createdBy: number;
                content: string;
                isPinned: boolean;
            })[];
        };
    }> | {
        success: boolean;
        message: string;
    };
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            note: {
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                title: string;
                leadId: number;
                createdBy: number;
                content: string;
                isPinned: boolean;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateNoteDto, user?: any): Promise<{
        success: boolean;
        data: {
            note: {
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                title: string;
                leadId: number;
                createdBy: number;
                content: string;
                isPinned: boolean;
            };
        };
    }>;
    update(id: string, dto: UpdateNoteDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            note: {
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                title: string;
                leadId: number;
                createdBy: number;
                content: string;
                isPinned: boolean;
            };
        };
        message?: undefined;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
