import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { PrismaService } from '../../database/prisma.service';
export declare class CurrenciesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createCurrencyDto: CreateCurrencyDto): Promise<{
        success: boolean;
        message: string;
        data: {
            currency: {
                symbol: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                isDefault: boolean;
                code: string;
                exchangeRate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            symbol: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            isDefault: boolean;
            code: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            currency: {
                symbol: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                isDefault: boolean;
                code: string;
                exchangeRate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    update(id: number, updateCurrencyDto: UpdateCurrencyDto): Promise<{
        success: boolean;
        message: string;
        data: {
            currency: {
                symbol: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                isDefault: boolean;
                code: string;
                exchangeRate: import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
