"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksManagementModule = void 0;
const common_1 = require("@nestjs/common");
const webhooks_management_service_1 = require("./webhooks-management.service");
const webhooks_management_controller_1 = require("./webhooks-management.controller");
const prisma_service_1 = require("../../database/prisma.service");
let WebhooksManagementModule = class WebhooksManagementModule {
};
exports.WebhooksManagementModule = WebhooksManagementModule;
exports.WebhooksManagementModule = WebhooksManagementModule = __decorate([
    (0, common_1.Module)({
        controllers: [webhooks_management_controller_1.WebhooksManagementController],
        providers: [webhooks_management_service_1.WebhooksManagementService, prisma_service_1.PrismaService],
        exports: [webhooks_management_service_1.WebhooksManagementService],
    })
], WebhooksManagementModule);
//# sourceMappingURL=webhooks-management.module.js.map