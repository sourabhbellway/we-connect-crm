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
exports.QuotationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const quotations_service_1 = require("./quotations.service");
const common_2 = require("@nestjs/common");
const update_quotation_dto_1 = require("./dto/update-quotation.dto");
const upsert_quotation_item_dto_1 = require("./dto/upsert-quotation-item.dto");
const create_quotation_dto_1 = require("./dto/create-quotation.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let QuotationsController = class QuotationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getTemplate() {
        return this.service.getTemplate();
    }
    getNextNumber() {
        return this.service.getNextNumber();
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
    get(id, user) {
        return this.service.getById(Number(id), user);
    }
    create(body, user) {
        console.log('QuotationsController.create called with body:', body);
        const normalizeStatus = (s) => (s ? String(s).toUpperCase() : undefined);
        const items = Array.isArray(body.items)
            ? body.items.map((it) => ({
                productId: it.productId ?? undefined,
                name: it.name ?? it.description ?? 'Item',
                description: it.longDescription ?? it.description ?? undefined,
                quantity: Number(it.quantity ?? 1),
                unit: it.unit ?? 'pcs',
                unitPrice: Number(it.unitPrice ?? it.rate ?? 0),
                taxRate: it.taxRate !== undefined ? Number(it.taxRate) : undefined,
                discountRate: it.discountRate !== undefined
                    ? Number(it.discountRate)
                    : body.discountType === '%'
                        ? Number(body.discountValue || 0)
                        : undefined,
            }))
            : [];
        const payload = {
            quotationNumber: body.quotationNumber,
            title: body.title ?? body.subject,
            description: body.description ?? undefined,
            status: normalizeStatus(body.status),
            discountAmount: body.discountType && body.discountType !== '%'
                ? Number(body.discountValue || 0)
                : undefined,
            currency: body.currency,
            validUntil: body.validUntil ?? body.openTill,
            notes: body.notes,
            terms: body.terms,
            companyId: body.companyId,
            leadId: body.relatedType === 'lead' ? Number(body.relatedId) : body.leadId,
            dealId: body.dealId,
            contactId: body.relatedType === 'contact' ? Number(body.relatedId) : body.contactId,
            createdBy: user?.userId || body.createdBy,
            items,
        };
        console.log('Normalized payload:', payload);
        return this.service.create(payload);
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
    accept(id) {
        return this.service.markAccepted(Number(id));
    }
    reject(id) {
        return this.service.markRejected(Number(id));
    }
    generateInvoice(id) {
        return this.service.generateInvoice(Number(id));
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
};
exports.QuotationsController = QuotationsController;
__decorate([
    (0, common_1.Get)('template'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "getNextNumber", null);
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
], QuotationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quotation_dto_1.UpdateQuotationDto]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_quotation_dto_1.CreateQuotationItemDto]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Put)('items/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_quotation_item_dto_1.UpsertQuotationItemDto]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Put)(':id/send'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "send", null);
__decorate([
    (0, common_1.Put)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "accept", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/generate-invoice'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "generateInvoice", null);
__decorate([
    (0, common_1.Get)(':id/pdf/preview'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "previewPdf", null);
__decorate([
    (0, common_1.Get)(':id/pdf/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "downloadPdf", null);
exports.QuotationsController = QuotationsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('quotations'),
    __metadata("design:paramtypes", [quotations_service_1.QuotationsService])
], QuotationsController);
//# sourceMappingURL=quotations.controller.js.map