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
    listDealStatuses() {
        return this.service.listDealStatuses();
    }
    createDealStatus(body) {
        return this.service.createDealStatus(body);
    }
    updateDealStatus(id, body) {
        return this.service.updateDealStatus(Number(id), body);
    }
    deleteDealStatus(id) {
        return this.service.deleteDealStatus(Number(id));
    }
    getAvailableIntegrations() {
        return this.service.getAvailableIntegrations();
    }
    getIntegrationsStatus() {
        return this.service.getIntegrationsStatus();
    }
    getSettings() {
        return this.service.getIntegrationSettings();
    }
    updateSettings(body) {
        return this.service.updateIntegrationSettings(body);
    }
    testIntegration(name) {
        return this.service.testIntegration(name);
    }
    syncIntegration(name) {
        return this.service.syncIntegration(name);
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
    listQuotationTemplates() {
        return this.service.listQuotationTemplates();
    }
    createQuotationTemplate(body) {
        return this.service.createQuotationTemplate(body);
    }
    updateQuotationTemplate(id, body) {
        return this.service.updateQuotationTemplate(Number(id), body);
    }
    deleteQuotationTemplate(id) {
        return this.service.deleteQuotationTemplate(Number(id));
    }
    setDefaultQuotationTemplate(id) {
        return this.service.setDefaultQuotationTemplate(Number(id));
    }
    listTermsAndConditions() {
        return this.service.listTermsAndConditions();
    }
    createTermsAndConditions(body) {
        return this.service.createTermsAndConditions(body);
    }
    updateTermsAndConditions(id, body) {
        return this.service.updateTermsAndConditions(Number(id), body);
    }
    deleteTermsAndConditions(id) {
        return this.service.deleteTermsAndConditions(Number(id));
    }
    setDefaultTermsAndConditions(id) {
        return this.service.setDefaultTermsAndConditions(Number(id));
    }
    getWelcomeEmailTemplate() {
        return this.service.getWelcomeEmailTemplate();
    }
    updateWelcomeEmailTemplate(body) {
        return this.service.upsertWelcomeEmailTemplate(body);
    }
    getEmailTemplatesByCategory(category) {
        return this.service.getEmailTemplatesByCategory(category);
    }
    getSystemEmailTemplate(category) {
        return this.service.getSystemEmailTemplate(category);
    }
    previewEmailTemplate(id, query) {
        return this.service.previewEmailTemplate(Number(id), query);
    }
    getEmailTemplates() {
        return this.service.getEmailTemplates();
    }
    createEmailTemplate(body) {
        return this.service.createEmailTemplate(body);
    }
    setDefaultEmailTemplate(id, body) {
        return this.service.setDefaultEmailTemplate(Number(id), body.category);
    }
    updateEmailTemplate(id, body) {
        return this.service.updateEmailTemplate(Number(id), body);
    }
    deleteEmailTemplate(id) {
        return this.service.deleteEmailTemplate(Number(id));
    }
    getFieldConfigs(entityType) {
        return this.service.getFieldConfigs(entityType);
    }
    createFieldConfig(body) {
        return this.service.createFieldConfig(body);
    }
    updateFieldConfig(id, body) {
        return this.service.updateFieldConfig(Number(id), body);
    }
    deleteFieldConfig(id) {
        return this.service.deleteFieldConfig(Number(id));
    }
    initializeDefaultFieldConfigs() {
        return this.service.initializeDefaultFieldConfigs();
    }
    getDashboardSettings() {
        return this.service.getDashboardSettings();
    }
    updateDashboardSettings(body) {
        return this.service.updateDashboardSettings(body);
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
    (0, common_1.Get)('deal-statuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "listDealStatuses", null);
__decorate([
    (0, common_1.Post)('deal-statuses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "createDealStatus", null);
__decorate([
    (0, common_1.Put)('deal-statuses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateDealStatus", null);
__decorate([
    (0, common_1.Delete)('deal-statuses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "deleteDealStatus", null);
__decorate([
    (0, common_1.Get)('integrations/available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getAvailableIntegrations", null);
__decorate([
    (0, common_1.Get)('integrations/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getIntegrationsStatus", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('integrations/:name/test'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "testIntegration", null);
__decorate([
    (0, common_1.Post)('integrations/:name/sync'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "syncIntegration", null);
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
__decorate([
    (0, common_1.Get)('quotation-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "listQuotationTemplates", null);
__decorate([
    (0, common_1.Post)('quotation-templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "createQuotationTemplate", null);
__decorate([
    (0, common_1.Put)('quotation-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateQuotationTemplate", null);
__decorate([
    (0, common_1.Delete)('quotation-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "deleteQuotationTemplate", null);
__decorate([
    (0, common_1.Put)('quotation-templates/:id/set-default'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "setDefaultQuotationTemplate", null);
__decorate([
    (0, common_1.Get)('terms-and-conditions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "listTermsAndConditions", null);
__decorate([
    (0, common_1.Post)('terms-and-conditions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "createTermsAndConditions", null);
__decorate([
    (0, common_1.Put)('terms-and-conditions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateTermsAndConditions", null);
__decorate([
    (0, common_1.Delete)('terms-and-conditions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "deleteTermsAndConditions", null);
__decorate([
    (0, common_1.Put)('terms-and-conditions/:id/set-default'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "setDefaultTermsAndConditions", null);
__decorate([
    (0, common_1.Get)('email-templates/welcome'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getWelcomeEmailTemplate", null);
__decorate([
    (0, common_1.Put)('email-templates/welcome'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateWelcomeEmailTemplate", null);
__decorate([
    (0, common_1.Get)('email-templates/category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getEmailTemplatesByCategory", null);
__decorate([
    (0, common_1.Get)('email-templates/system/:category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getSystemEmailTemplate", null);
__decorate([
    (0, common_1.Get)('email-templates/preview/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "previewEmailTemplate", null);
__decorate([
    (0, common_1.Get)('email-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getEmailTemplates", null);
__decorate([
    (0, common_1.Post)('email-templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "createEmailTemplate", null);
__decorate([
    (0, common_1.Put)('email-templates/:id/set-default'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "setDefaultEmailTemplate", null);
__decorate([
    (0, common_1.Put)('email-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateEmailTemplate", null);
__decorate([
    (0, common_1.Delete)('email-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "deleteEmailTemplate", null);
__decorate([
    (0, common_1.Get)('field-configs/:entityType'),
    __param(0, (0, common_1.Param)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getFieldConfigs", null);
__decorate([
    (0, common_1.Post)('field-configs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "createFieldConfig", null);
__decorate([
    (0, common_1.Put)('field-configs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateFieldConfig", null);
__decorate([
    (0, common_1.Delete)('field-configs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "deleteFieldConfig", null);
__decorate([
    (0, common_1.Post)('field-configs/initialize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "initializeDefaultFieldConfigs", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "getDashboardSettings", null);
__decorate([
    (0, common_1.Put)('dashboard'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessSettingsController.prototype, "updateDashboardSettings", null);
exports.BusinessSettingsController = BusinessSettingsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('business-settings'),
    __metadata("design:paramtypes", [business_settings_service_1.BusinessSettingsService])
], BusinessSettingsController);
//# sourceMappingURL=business-settings.controller.js.map