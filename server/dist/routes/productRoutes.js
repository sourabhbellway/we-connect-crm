"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = __importDefault(require("../controllers/productController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get all products
router.get("/", productController_1.default.getAllProducts.bind(productController_1.default));
// Get product categories
router.get("/categories", productController_1.default.getCategories.bind(productController_1.default));
// Get low stock products
router.get("/low-stock", productController_1.default.getLowStockProducts.bind(productController_1.default));
// Get product by ID
router.get("/:id", productController_1.default.getProductById.bind(productController_1.default));
// Create product
router.post("/", productController_1.default.createProduct.bind(productController_1.default));
// Update product
router.put("/:id", productController_1.default.updateProduct.bind(productController_1.default));
// Bulk update stock
router.post("/bulk-update-stock", productController_1.default.bulkUpdateStock.bind(productController_1.default));
// Delete product
router.delete("/:id", productController_1.default.deleteProduct.bind(productController_1.default));
exports.default = router;
//# sourceMappingURL=productRoutes.js.map