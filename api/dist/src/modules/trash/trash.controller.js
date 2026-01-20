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
exports.TrashController = void 0;
const common_1 = require("@nestjs/common");
const trash_service_1 = require("./trash.service");
const passport_1 = require("@nestjs/passport");
let TrashController = class TrashController {
    trashService;
    constructor(trashService) {
        this.trashService = trashService;
    }
    getStats() {
        return this.trashService.getStats();
    }
    findAll(page, limit, type, search) {
        return this.trashService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            type: type || 'all',
            search: search || '',
        });
    }
    restore(type, id) {
        return this.trashService.restore(type, parseInt(id));
    }
    permanentDelete(type, id) {
        return this.trashService.permanentDelete(type, parseInt(id));
    }
    emptyTrash(type) {
        return this.trashService.emptyTrash(type);
    }
};
exports.TrashController = TrashController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrashController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TrashController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':type/:id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TrashController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':type/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TrashController.prototype, "permanentDelete", null);
__decorate([
    (0, common_1.Delete)('empty/:type'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrashController.prototype, "emptyTrash", null);
exports.TrashController = TrashController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('trash'),
    __metadata("design:paramtypes", [trash_service_1.TrashService])
], TrashController);
//# sourceMappingURL=trash.controller.js.map