"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSettingsModule = void 0;
const common_1 = require("@nestjs/common");
const business_settings_service_1 = require("./business-settings.service");
const business_settings_controller_1 = require("./business-settings.controller");
const invoice_templates_service_1 = require("./invoice-templates.service");
const invoice_templates_controller_1 = require("./invoice-templates.controller");
const prisma_service_1 = require("../../database/prisma.service");
const product_categories_module_1 = require("../product-categories/product-categories.module");
const unit_types_module_1 = require("../unit-types/unit-types.module");
let BusinessSettingsModule = class BusinessSettingsModule {
};
exports.BusinessSettingsModule = BusinessSettingsModule;
exports.BusinessSettingsModule = BusinessSettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [product_categories_module_1.ProductCategoriesModule, unit_types_module_1.UnitTypesModule],
        controllers: [business_settings_controller_1.BusinessSettingsController, invoice_templates_controller_1.InvoiceTemplatesController],
        providers: [business_settings_service_1.BusinessSettingsService, invoice_templates_service_1.InvoiceTemplatesService, prisma_service_1.PrismaService],
        exports: [business_settings_service_1.BusinessSettingsService, invoice_templates_service_1.InvoiceTemplatesService],
    })
], BusinessSettingsModule);
//# sourceMappingURL=business-settings.module.js.map