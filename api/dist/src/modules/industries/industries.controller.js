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
exports.IndustriesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const industries_service_1 = require("./industries.service");
const upsert_industry_dto_1 = require("./dto/upsert-industry.dto");
const upsert_industry_field_dto_1 = require("./dto/upsert-industry-field.dto");
let IndustriesController = class IndustriesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list() {
        return this.service.list();
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(Number(id), dto);
    }
    remove(id) {
        return this.service.remove(Number(id));
    }
    addField(industryId, dto) {
        return this.service.addField(Number(industryId), dto);
    }
    updateField(fieldId, dto) {
        return this.service.updateField(Number(fieldId), dto);
    }
    removeField(fieldId) {
        return this.service.removeField(Number(fieldId));
    }
};
exports.IndustriesController = IndustriesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IndustriesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_industry_dto_1.UpsertIndustryDto]),
    __metadata("design:returntype", void 0)
], IndustriesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_industry_dto_1.UpsertIndustryDto]),
    __metadata("design:returntype", void 0)
], IndustriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IndustriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':industryId/fields'),
    __param(0, (0, common_1.Param)('industryId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_industry_field_dto_1.UpsertIndustryFieldDto]),
    __metadata("design:returntype", void 0)
], IndustriesController.prototype, "addField", null);
__decorate([
    (0, common_1.Put)('fields/:fieldId'),
    __param(0, (0, common_1.Param)('fieldId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_industry_field_dto_1.UpsertIndustryFieldDto]),
    __metadata("design:returntype", void 0)
], IndustriesController.prototype, "updateField", null);
__decorate([
    (0, common_1.Delete)('fields/:fieldId'),
    __param(0, (0, common_1.Param)('fieldId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IndustriesController.prototype, "removeField", null);
exports.IndustriesController = IndustriesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('industries'),
    __metadata("design:paramtypes", [industries_service_1.IndustriesService])
], IndustriesController);
//# sourceMappingURL=industries.controller.js.map