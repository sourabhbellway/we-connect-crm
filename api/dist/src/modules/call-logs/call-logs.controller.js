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
exports.CallLogsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const call_logs_service_1 = require("./call-logs.service");
const create_call_log_dto_1 = require("./dto/create-call-log.dto");
const update_call_log_dto_1 = require("./dto/update-call-log.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let CallLogsController = class CallLogsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(leadId, userId, page, limit, user) {
        return this.service.list({
            leadId: leadId ? parseInt(leadId) : undefined,
            userId: userId ? parseInt(userId) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        }, user);
    }
    listByLead(leadId, user) {
        return this.service.list({
            leadId: parseInt(leadId),
        }, user);
    }
    get(id, user) {
        return this.service.getById(Number(id), user);
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
    async initiate(dto, fcm) {
        const result = await this.service.create(dto);
        if (fcm) {
            try {
            }
            catch (error) {
                console.error('Failed to send mobile notification:', error);
            }
        }
        return result;
    }
};
exports.CallLogsController = CallLogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('leadId')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], CallLogsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CallLogsController.prototype, "listByLead", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CallLogsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_call_log_dto_1.CreateCallLogDto]),
    __metadata("design:returntype", void 0)
], CallLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_call_log_dto_1.UpdateCallLogDto]),
    __metadata("design:returntype", void 0)
], CallLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallLogsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('initiate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('fcm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_call_log_dto_1.CreateCallLogDto, String]),
    __metadata("design:returntype", Promise)
], CallLogsController.prototype, "initiate", null);
exports.CallLogsController = CallLogsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('call-logs'),
    __metadata("design:paramtypes", [call_logs_service_1.CallLogsService])
], CallLogsController);
//# sourceMappingURL=call-logs.controller.js.map