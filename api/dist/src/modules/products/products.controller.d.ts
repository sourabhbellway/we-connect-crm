import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly service;
    constructor(service: ProductsService);
    list(page?: string, limit?: string, search?: string): Promise<{
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
                category: string | null;
                type: import("@prisma/client").$Enums.ProductType;
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
    get(id: string): Promise<{
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
                category: string | null;
                type: import("@prisma/client").$Enums.ProductType;
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
                category: string | null;
                type: import("@prisma/client").$Enums.ProductType;
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
    update(id: string, dto: UpdateProductDto): Promise<{
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
                category: string | null;
                type: import("@prisma/client").$Enums.ProductType;
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
