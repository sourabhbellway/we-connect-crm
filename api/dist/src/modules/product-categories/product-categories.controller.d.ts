import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
export declare class ProductCategoriesController {
    private readonly productCategoriesService;
    constructor(productCategoriesService: ProductCategoriesService);
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
