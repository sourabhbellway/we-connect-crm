import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
export declare class TaxesController {
    private readonly taxesService;
    constructor(taxesService: TaxesService);
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
    findOne(id: string): Promise<{
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
    update(id: string, updateTaxDto: UpdateTaxDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
