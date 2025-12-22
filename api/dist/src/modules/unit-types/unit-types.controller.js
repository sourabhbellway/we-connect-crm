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
exports.UnitTypesController = void 0;
const common_1 = require("@nestjs/common");
const unit_types_service_1 = require("./unit-types.service");
const create_unit_type_dto_1 = require("./dto/create-unit-type.dto");
const update_unit_type_dto_1 = require("./dto/update-unit-type.dto");
let UnitTypesController = class UnitTypesController {
    unitTypesService;
    constructor(unitTypesService) {
        this.unitTypesService = unitTypesService;
    }
    create(createUnitTypeDto) {
        return this.unitTypesService.create(createUnitTypeDto);
    }
    findAll() {
        return this.unitTypesService.findAll();
    }
    findOne(id) {
        return this.unitTypesService.findOne(id);
    }
    update(id, updateUnitTypeDto) {
        return this.unitTypesService.update(id, updateUnitTypeDto);
    }
    remove(id) {
        return this.unitTypesService.remove(id);
    }
    toggleActive(id) {
        return this.unitTypesService.toggleActive(id);
    }
};
exports.UnitTypesController = UnitTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_unit_type_dto_1.CreateUnitTypeDto]),
    __metadata("design:returntype", void 0)
], UnitTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UnitTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UnitTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_unit_type_dto_1.UpdateUnitTypeDto]),
    __metadata("design:returntype", void 0)
], UnitTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UnitTypesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UnitTypesController.prototype, "toggleActive", null);
exports.UnitTypesController = UnitTypesController = __decorate([
    (0, common_1.Controller)('business-settings/unit-types'),
    __metadata("design:paramtypes", [unit_types_service_1.UnitTypesService])
], UnitTypesController);
//# sourceMappingURL=unit-types.controller.js.map