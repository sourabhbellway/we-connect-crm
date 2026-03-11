import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { PrismaService } from '../../database/prisma.service';
export declare class TaxesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createTaxDto: CreateTaxDto): Promise<{
        success: boolean;
        message: string;
        data: {
            tax: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                rate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            rate: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            tax: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                rate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    update(id: number, updateTaxDto: UpdateTaxDto): Promise<{
        success: boolean;
        message: string;
        data: {
            tax: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                rate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
