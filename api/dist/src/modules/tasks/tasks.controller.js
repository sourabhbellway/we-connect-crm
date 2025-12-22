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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const tasks_service_1 = require("./tasks.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let TasksController = class TasksController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(page, limit, status, search, leadId, dealId, entityType, entityId, assignedTo, user) {
        let lead = leadId ? parseInt(leadId) : undefined;
        let deal = dealId ? parseInt(dealId) : undefined;
        if (!lead && !deal && entityType && entityId) {
            const idNum = parseInt(entityId);
            if (entityType === 'lead')
                lead = idNum;
            if (entityType === 'deal')
                deal = idNum;
        }
        return this.service.list({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            status,
            search,
            leadId: lead,
            dealId: deal,
            assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
        }, user);
    }
    get(id, user) {
        return this.service.getById(Number(id), user);
    }
    create(dto, user) {
        const mapped = { ...dto };
        const et = mapped.entityType?.toLowerCase();
        if (mapped.entityId && et) {
            const idNum = Number(mapped.entityId);
            if (et === 'lead')
                mapped.leadId = idNum;
            if (et === 'deal')
                mapped.dealId = idNum;
            delete mapped.entityType;
            delete mapped.entityId;
        }
        if (user?.userId) {
            mapped.createdBy = user.userId;
        }
        return this.service.create(mapped);
    }
    update(id, dto) {
        return this.service.update(Number(id), dto);
    }
    complete(id) {
        return this.service.complete(Number(id));
    }
    remove(id) {
        return this.service.remove(Number(id));
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('leadId')),
    __param(5, (0, common_1.Query)('dealId')),
    __param(6, (0, common_1.Query)('entityType')),
    __param(7, (0, common_1.Query)('entityId')),
    __param(8, (0, common_1.Query)('assignedTo')),
    __param(9, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map