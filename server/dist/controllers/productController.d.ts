import { Request, Response } from "express";
export declare class ProductController {
    getAllProducts(req: Request, res: Response): Promise<void>;
    getProductById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCategories(req: Request, res: Response): Promise<void>;
    bulkUpdateStock(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getLowStockProducts(req: Request, res: Response): Promise<void>;
}
declare const _default: ProductController;
export default _default;
//# sourceMappingURL=productController.d.ts.map