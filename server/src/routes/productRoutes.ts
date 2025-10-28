import { Router } from "express";
import productController from "../controllers/productController";
import { authenticateToken as authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all products
router.get("/", productController.getAllProducts.bind(productController));

// Get product categories
router.get("/categories", productController.getCategories.bind(productController));

// Get low stock products
router.get("/low-stock", productController.getLowStockProducts.bind(productController));

// Get product by ID
router.get("/:id", productController.getProductById.bind(productController));

// Create product
router.post("/", productController.createProduct.bind(productController));

// Update product
router.put("/:id", productController.updateProduct.bind(productController));

// Bulk update stock
router.post("/bulk-update-stock", productController.bulkUpdateStock.bind(productController));

// Delete product
router.delete("/:id", productController.deleteProduct.bind(productController));

export default router;
