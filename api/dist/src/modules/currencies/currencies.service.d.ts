import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { PrismaService } from '../../database/prisma.service';
export declare class CurrenciesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: number): import("@prisma/client").Prisma.Prisma__CurrencyClient<{
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
    update(id: number, updateCurrencyDto: UpdateCurrencyDto): Promise<{
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
    remove(id: number): import("@prisma/client").Prisma.Prisma__CurrencyClient<{
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
