export declare class CreateProductDto {
    name: string;
    description?: string;
    sku?: string;
    type?: string;
    category?: string;
    price?: number;
    pricingEnabled?: boolean;
    cost?: number;
    currency?: string;
    unit?: string;
    taxRate?: number;
    hsnCode?: string;
    stockQuantity?: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    image?: string;
    categoryId?: number;
    currencyId?: number;
    taxId?: number;
    unitId?: number;
    isActive?: boolean;
}
