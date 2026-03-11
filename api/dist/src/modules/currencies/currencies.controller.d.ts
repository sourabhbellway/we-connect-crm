import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
export declare class CurrenciesController {
    private readonly currenciesService;
    constructor(currenciesService: CurrenciesService);
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
    findOne(id: string): Promise<{
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
    update(id: string, updateCurrencyDto: UpdateCurrencyDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
