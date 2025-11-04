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
exports.BusinessSettingsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const business_settings_service_1 = require("./business-settings.service");
let BusinessSettingsController = class BusinessSettingsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getCompany() {
        return this.service.getCompany();
    }
    updateCompany(body) {
        return this.service.updateCompany(body);
    }
    uploadLogo(file) {
        return this.service.uploadLogo(file);
    }
    getCurrency() {
        return this.service.getCurrency();
    }
    updateCurrency(body) {
        return this.service.updateCurrency(body);
    }
    getTax() {
        return this.service.getTax();
    }
    updateTax(body) {
        return this.service.updateTax(body);
    }
    getAll() {
        return this.service.getAllBusinessSettings();
    }
    getNumbering() {
        return this.service.getNumbering();
    }
    updateNumbering(body) {
        return this.service.updateNumbering(body);
    }
    getPipelines() {
        return this.service.getPipelines();
    }
    listLeadSources() {
        return this.service.listLeadSources();
    }
    createLeadSource(body) {
        return this.service.createLeadSource(body);
    }
    updateLeadSource(body) {
        return this.service.updateLeadSource(body);
    }
};
exports.BusinessSettingsController = BusinessSettingsController;
__decorate([
    (0, common_1.Get)('company'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getCompany", null);
__decorate([
    (0, common_1.Put)('company'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateCompany", null);
__decorate([
    (0, common_1.Post)('company/logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Get)('currency'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getCurrency", null);
__decorate([
    (0, common_1.Put)('currency'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateCurrency", null);
__decorate([
    (0, common_1.Get)('tax'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getTax", null);
__decorate([
    (0, common_1.Put)('tax'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateTax", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('numbering'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getNumbering", null);
__decorate([
    (0, common_1.Put)('numbering'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateNumbering", null);
__decorate([
    (0, common_1.Get)('pipelines'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getPipelines", null);
__decorate([
    (0, common_1.Get)('lead-sources'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "listLeadSources", null);
__decorate([
    (0, common_1.Post)('lead-sources'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "createLeadSource", null);
__decorate([
    (0, common_1.Put)('lead-sources/:id'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateLeadSource", null);
exports.BusinessSettingsController = BusinessSettingsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('business-settings'),
    __metadata("design:paramtypes", [business_settings_service_1.BusinessSettingsService])
], BusinessSettingsController);
//# sourceMappingURL=business-settings.controller.js.map