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
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                currency: string;
                description: string | null;
                type: import("@prisma/client").$Enums.ProductType;
                sku: string | null;
                category: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
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
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                currency: string;
                description: string | null;
                type: import("@prisma/client").$Enums.ProductType;
                sku: string | null;
                category: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
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
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                currency: string;
                description: string | null;
                type: import("@prisma/client").$Enums.ProductType;
                sku: string | null;
                category: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
            };
        };
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        success: boolean;
        message: string;
        data: {
            product: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                currency: string;
                description: string | null;
                type: import("@prisma/client").$Enums.ProductType;
                sku: string | null;
                category: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal | null;
                unit: string | null;
                taxRate: import("@prisma/client/runtime/library").Decimal | null;
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
