import { PrismaService } from '../../database/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
export declare class ProductCategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductCategoryDto: CreateProductCategoryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
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
            deletedAt: Date | null;
        }[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        };
    }>;
    private getCategoryOrThrow;
    update(id: number, updateProductCategoryDto: UpdateProductCategoryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleActive(id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        };
    }>;
}
