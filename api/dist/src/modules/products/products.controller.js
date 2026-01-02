"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
let ProductsController = class ProductsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(page, limit, search, status, category) {
        return this.service.list({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            search,
            status,
            category,
        });
    }
    get(id) {
        return this.service.getById(Number(id));
    }
    async create(dto) {
        try {
            console.log('Creating product with data:', JSON.stringify(dto, null, 2));
            const result = await this.service.create(dto);
            if (!result.success) {
                throw new common_1.HttpException({ success: false, message: result.message }, common_1.HttpStatus.BAD_REQUEST);
            }
            return result;
        }
        catch (error) {
            console.error('Error in products controller:', error);
            console.error('Error stack:', error.stack);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            const errorMessage = error?.response?.message || error?.message || 'Failed to create product';
            throw new common_1.HttpException({ success: false, message: errorMessage }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, dto) {
        try {
            const result = await this.service.update(Number(id), dto);
            if (!result.success) {
                throw new common_1.HttpException({ success: false, message: result.message }, common_1.HttpStatus.BAD_REQUEST);
            }
            return result;
        }
        catch (error) {
            console.error('Error in products controller:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({ success: false, message: error.message || 'Failed to update product' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    remove(id) {
        return this.service.remove(Number(id));
    }
    async bulkDelete(dto) {
        if (!dto.ids || !Array.isArray(dto.ids) || dto.ids.length === 0) {
            throw new common_1.BadRequestException('Product IDs are required');
        }
        return this.service.bulkDelete(dto.ids.map(Number));
    }
    async bulkExport(res, search) {
        const csv = await this.service.bulkExport({ search });
        const filename = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
        const bom = '\uFEFF';
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(Buffer.from(bom + csv, 'utf8'));
    }
    async bulkImport(file) {
        if (!file) {
            throw new common_1.BadRequestException('CSV file is required');
        }
        return this.service.bulkImportFromCsv(file);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('bulk/delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Get)('bulk/export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "bulkExport", null);
__decorate([
    (0, common_1.Post)('bulk/import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('csvFile')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "bulkImport", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map