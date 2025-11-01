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
exports.BulkImportController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const bulk_import_service_1 = require("./bulk-import.service");
const create_lead_import_batch_dto_1 = require("./dto/create-lead-import-batch.dto");
let BulkImportController = class BulkImportController {
    service;
    constructor(service) {
        this.service = service;
    }
    createBatch(dto) {
        return this.service.createLeadBatch(dto);
    }
    listBatches(page, limit) {
        return this.service.listBatches({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });
    }
    listRecords(id) {
        return this.service.listRecords(Number(id));
    }
};
exports.BulkImportController = BulkImportController;
__decorate([
    (0, common_1.Post)('leads'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_import_batch_dto_1.CreateLeadImportBatchDto]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "createBatch", null);
__decorate([
    (0, common_1.Get)('leads/batches'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "listBatches", null);
__decorate([
    (0, common_1.Get)('leads/batches/:id/records'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "listRecords", null);
exports.BulkImportController = BulkImportController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('bulk-import'),
    __metadata("design:paramtypes", [bulk_import_service_1.BulkImportService])
], BulkImportController);
//# sourceMappingURL=bulk-import.controller.js.map