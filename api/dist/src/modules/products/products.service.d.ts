import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, search, }: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                companyId: number | null;
                name: string;
                description: string | null;
                currency: string;
                type: import("@prisma/client").$Enums.ProductType;
                category: string | null;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
                hsnCode: string | null;
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getById(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                companyId: number | null;
                name: string;
                description: string | null;
                currency: string;
                type: import("@prisma/client").$Enums.ProductType;
                category: string | null;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
                hsnCode: string | null;
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateProductDto): Promise<{
        success: boolean;
        message: string;
        data: {
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                companyId: number | null;
                name: string;
                description: string | null;
                currency: string;
                type: import("@prisma/client").$Enums.ProductType;
                category: string | null;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
                hsnCode: string | null;
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
            };
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        success: boolean;
        message: string;
        data: {
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                companyId: number | null;
                name: string;
                description: string | null;
                currency: string;
                type: import("@prisma/client").$Enums.ProductType;
                category: string | null;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
                hsnCode: string | null;
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
            };
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkExport(opts?: {
        search?: string;
    }): Promise<string>;
    bulkImportFromCsv(file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            imported: number;
            failed: number;
            errors: {
                row: number;
                error: string;
            }[];
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    bulkDelete(ids: number[]): Promise<{
        success: boolean;
        message: string;
    }>;
}
