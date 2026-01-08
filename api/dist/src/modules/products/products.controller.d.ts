import type { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly service;
    constructor(service: ProductsService);
    list(page?: string, limit?: string, search?: string, status?: string, category?: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
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
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
                hsnCode: string | null;
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
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
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
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
                hsnCode: string | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateProductDto): Promise<{
        success: boolean;
        message: string;
        data: {
            product: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
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
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
                hsnCode: string | null;
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
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
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
                stockQuantity: number | null;
                minStockLevel: number | null;
                maxStockLevel: number | null;
                image: string | null;
                hsnCode: string | null;
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
    bulkDelete(dto: {
        ids: number[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkExport(res: Response, search?: string): Promise<void>;
    bulkImport(file: Express.Multer.File): Promise<{
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
}
