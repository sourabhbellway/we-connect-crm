import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
export declare class TaxesController {
    private readonly taxesService;
    constructor(taxesService: TaxesService);
    create(createTaxDto: CreateTaxDto): import("@prisma/client").Prisma.Prisma__TaxClient<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__TaxClient<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateTaxDto: UpdateTaxDto): import("@prisma/client").Prisma.Prisma__TaxClient<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__TaxClient<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
