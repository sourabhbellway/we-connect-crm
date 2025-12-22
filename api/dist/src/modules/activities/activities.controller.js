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
exports.ActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const activities_service_1 = require("./activities.service");
const create_activity_dto_1 = require("./dto/create-activity.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let ActivitiesController = class ActivitiesController {
    service;
    constructor(service) {
        this.service = service;
    }
    getRecent(limit, userId, user) {
        return this.service.getRecent(limit ? parseInt(limit) : 5, user, userId ? parseInt(userId) : undefined);
    }
    getStats() {
        return this.service.getStats();
    }
    getDeletedData(page, limit) {
        return this.service.getDeletedData({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });
    }
    list(page, limit, type, user) {
        return this.service.list({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            type,
        }, user);
    }
    create(dto, user) {
        if (user?.userId) {
            dto.userId = user.userId;
        }
        return this.service.create(dto);
    }
    getActivitiesByLeadId(leadId, page, limit) {
        return this.service.getActivitiesByLeadId(parseInt(leadId), {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });
    }
    getActivitiesForCalendar(startDate, endDate, user) {
        return this.service.getActivitiesForCalendar({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        }, user);
    }
};
exports.ActivitiesController = ActivitiesController;
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "getRecent", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('deleted-data'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "getDeletedData", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_activity_dto_1.CreateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "getActivitiesByLeadId", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "getActivitiesForCalendar", null);
exports.ActivitiesController = ActivitiesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('activities'),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], ActivitiesController);
//# sourceMappingURL=activities.controller.js.map