import { PrismaService } from '../../database/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(leadId: number, user?: any): Promise<{
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
    }>;
    getById(id: number, user?: any): Promise<{
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
    create(dto: CreateNoteDto): Promise<{
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
    update(id: number, dto: UpdateNoteDto): Promise<{
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
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
