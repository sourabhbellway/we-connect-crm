export declare class CreateProductDto {
    name: string;
    description?: string;
    sku?: string;
    type?: string;
    category?: string;
    price: number;
    cost?: number;
    currency?: string;
    unit?: string;
    taxRate?: number;
    hsnCode?: string;
    stockQuantity?: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    image?: string;
    isActive?: boolean;
}
