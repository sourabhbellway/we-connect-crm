import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
export declare class CurrenciesController {
    private readonly currenciesService;
    constructor(currenciesService: CurrenciesService);
    create(createCurrencyDto: CreateCurrencyDto): Promise<{
        symbol: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        isDefault: boolean;
        code: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        symbol: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        isDefault: boolean;
        code: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__CurrencyClient<{
        symbol: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        isDefault: boolean;
        code: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateCurrencyDto: UpdateCurrencyDto): Promise<{
        symbol: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        isDefault: boolean;
        code: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__CurrencyClient<{
        symbol: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        isDefault: boolean;
        code: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
