"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitTypesModule = void 0;
const common_1 = require("@nestjs/common");
const unit_types_service_1 = require("./unit-types.service");
const unit_types_controller_1 = require("./unit-types.controller");
const prisma_service_1 = require("../../database/prisma.service");
let UnitTypesModule = class UnitTypesModule {
};
exports.UnitTypesModule = UnitTypesModule;
exports.UnitTypesModule = UnitTypesModule = __decorate([
    (0, common_1.Module)({
        controllers: [unit_types_controller_1.UnitTypesController],
        providers: [unit_types_service_1.UnitTypesService, prisma_service_1.PrismaService],
        exports: [unit_types_service_1.UnitTypesService],
    })
], UnitTypesModule);
//# sourceMappingURL=unit-types.module.js.map