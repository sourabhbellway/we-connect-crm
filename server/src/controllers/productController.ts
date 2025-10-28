import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export class ProductController {
  // Get all products
  async getAllProducts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        type,
        category,
        isActive,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: Prisma.ProductWhereInput = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
          { sku: { contains: search as string, mode: "insensitive" } },
        ];
      }

      if (type) {
        where.type = type as any;
      }

      if (category) {
        where.category = category as string;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        success: true,
        data: products,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findFirst({
        where: {
          id: parseInt(id),
          deletedAt: null,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });
    }
  }

  // Create product
  async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        sku,
        type,
        category,
        price,
        cost,
        currency,
        unit,
        taxRate,
        stockQuantity,
        minStockLevel,
        maxStockLevel,
        image,
        companyId,
      } = req.body;

      // Validate required fields
      if (!name || price === undefined) {
        return res.status(400).json({
          success: false,
          message: "Name and price are required",
        });
      }

      const product = await prisma.product.create({
        data: {
          name,
          description,
          sku,
          type: type || "PHYSICAL",
          category,
          price: new Prisma.Decimal(price),
          cost: cost ? new Prisma.Decimal(cost) : null,
          currency: currency || "USD",
          unit,
          taxRate: taxRate ? new Prisma.Decimal(taxRate) : null,
          stockQuantity,
          minStockLevel,
          maxStockLevel,
          image,
          companyId,
        },
      });

      res.status(201).json({
        success: true,
        data: product,
        message: "Product created successfully",
      });
    } catch (error: any) {
      console.error("Error creating product:", error);
      
      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "Product SKU already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: any = { ...req.body };

      // Convert numeric fields to Decimal if present
      if (updateData.price !== undefined) {
        updateData.price = new Prisma.Decimal(updateData.price);
      }
      if (updateData.cost !== undefined) {
        updateData.cost = new Prisma.Decimal(updateData.cost);
      }
      if (updateData.taxRate !== undefined) {
        updateData.taxRate = new Prisma.Decimal(updateData.taxRate);
      }

      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.json({
        success: true,
        data: product,
        message: "Product updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating product:", error);

      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "Product SKU already exists",
        });
      }

      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  }

  // Delete product (soft delete)
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.product.update({
        where: { id: parseInt(id) },
        data: { deletedAt: new Date() },
      });

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }
  }

  // Get product categories
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.product.findMany({
        where: {
          deletedAt: null,
          category: { not: null },
        },
        select: {
          category: true,
        },
        distinct: ["category"],
      });

      const categoryList = categories
        .map((c) => c.category)
        .filter((c) => c !== null);

      res.json({
        success: true,
        data: categoryList,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }
  }

  // Bulk update stock
  async bulkUpdateStock(req: Request, res: Response) {
    try {
      const { updates } = req.body; // Array of { id, stockQuantity }

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          message: "Updates must be an array",
        });
      }

      const results = await Promise.all(
        updates.map((update) =>
          prisma.product.update({
            where: { id: update.id },
            data: { stockQuantity: update.stockQuantity },
          })
        )
      );

      res.json({
        success: true,
        data: results,
        message: "Stock updated successfully",
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update stock",
      });
    }
  }

  // Get low stock products
  async getLowStockProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          AND: [
            { stockQuantity: { not: null } },
            { minStockLevel: { not: null } },
          ],
        },
      });

      const lowStockProducts = products.filter(
        (p) => p.stockQuantity !== null && 
               p.minStockLevel !== null && 
               p.stockQuantity <= p.minStockLevel
      );

      res.json({
        success: true,
        data: lowStockProducts,
      });
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch low stock products",
      });
    }
  }
}

export default new ProductController();
