import { PrismaService } from '../../database/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
export declare class ProductCategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductCategoryDto: CreateProductCategoryDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    findAll(): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }[]>;
    findOne(id: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    update(id: number, updateProductCategoryDto: UpdateProductCategoryDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    remove(id: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
    toggleActive(id: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
    }>;
}
