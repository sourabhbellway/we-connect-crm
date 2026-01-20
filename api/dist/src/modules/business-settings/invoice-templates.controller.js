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
exports.InvoiceTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const invoice_templates_service_1 = require("./invoice-templates.service");
const passport_1 = require("@nestjs/passport");
let InvoiceTemplatesController = class InvoiceTemplatesController {
    invoiceTemplatesService;
    constructor(invoiceTemplatesService) {
        this.invoiceTemplatesService = invoiceTemplatesService;
    }
    async findAll() {
        const templates = await this.invoiceTemplatesService.findAll();
        return { success: true, data: templates };
    }
    async findOne(id) {
        const template = await this.invoiceTemplatesService.findOne(+id);
        return { success: true, data: template };
    }
    async create(data) {
        const template = await this.invoiceTemplatesService.create(data);
        return { success: true, data: template };
    }
    async update(id, data) {
        const template = await this.invoiceTemplatesService.update(+id, data);
        return { success: true, data: template };
    }
    async setDefault(id) {
        await this.invoiceTemplatesService.setDefault(+id);
        return { success: true, message: 'Default template updated' };
    }
    async delete(id) {
        await this.invoiceTemplatesService.delete(+id);
        return { success: true, message: 'Template deleted' };
    }
};
exports.InvoiceTemplatesController = InvoiceTemplatesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoiceTemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceTemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/set-default'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceTemplatesController.prototype, "setDefault", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceTemplatesController.prototype, "delete", null);
exports.InvoiceTemplatesController = InvoiceTemplatesController = __decorate([
    (0, common_1.Controller)('business-settings/invoice-templates'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [invoice_templates_service_1.InvoiceTemplatesService])
], InvoiceTemplatesController);
//# sourceMappingURL=invoice-templates.controller.js.map