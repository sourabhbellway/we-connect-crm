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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const invoices_service_1 = require("./invoices.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const update_invoice_dto_1 = require("./dto/update-invoice.dto");
const upsert_invoice_item_dto_1 = require("./dto/upsert-invoice-item.dto");
const create_invoice_dto_2 = require("./dto/create-invoice.dto");
const record_payment_dto_1 = require("./dto/record-payment.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let InvoicesController = class InvoicesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(page, limit, search, status, entityType, entityId, user) {
        return this.service.list({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            search,
            status,
            entityType,
            entityId,
        }, user);
    }
    getNextNumber() {
        return this.service.getNextNumber();
    }
    async previewPdf(id, res) {
        const { buffer, filename } = await this.service.buildPdf(Number(id));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.send(buffer);
    }
    async downloadPdf(id, res) {
        const { buffer, filename } = await this.service.buildPdf(Number(id));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    get(id, user) {
        return this.service.getById(Number(id), user);
    }
    create(dto, user) {
        if (user?.userId) {
            dto.createdBy = user.userId;
        }
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(Number(id), dto);
    }
    remove(id) {
        return this.service.remove(Number(id));
    }
    addItem(id, dto) {
        return this.service.addItem(Number(id), dto);
    }
    updateItem(itemId, dto) {
        return this.service.updateItem(Number(itemId), dto);
    }
    removeItem(itemId) {
        return this.service.removeItem(Number(itemId));
    }
    send(id) {
        return this.service.markSent(Number(id));
    }
    recordPayment(id, dto) {
        return this.service.recordPayment(Number(id), dto);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('entityType')),
    __param(5, (0, common_1.Query)('entityId')),
    __param(6, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(':id/pdf/preview'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "previewPdf", null);
__decorate([
    (0, common_1.Get)(':id/pdf/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_invoice_dto_1.UpdateInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_invoice_dto_2.CreateInvoiceItemDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "addItem", null);
__decorate([
    (0, common_1.Put)('items/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_invoice_item_dto_1.UpsertInvoiceItemDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Put)(':id/send'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, record_payment_dto_1.RecordPaymentDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "recordPayment", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map