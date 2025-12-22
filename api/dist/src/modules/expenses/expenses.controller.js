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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const expenses_service_1 = require("./expenses.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const update_expense_dto_1 = require("./dto/update-expense.dto");
const approve_expense_dto_1 = require("./dto/approve-expense.dto");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permission_decorator_1 = require("../../common/decorators/permission.decorator");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let ExpensesController = class ExpensesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(page, limit, status, search, submittedBy, startDate, endDate, type, projectId, dealId, leadId, currency, user) {
        return this.service.list({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            status,
            search,
            submittedBy: submittedBy ? parseInt(submittedBy) : undefined,
            startDate,
            endDate,
            type,
            projectId: projectId ? parseInt(projectId) : undefined,
            dealId: dealId ? parseInt(dealId) : undefined,
            leadId: leadId ? parseInt(leadId) : undefined,
            currency,
        }, user);
    }
    getStats(userId) {
        return this.service.getStats(userId ? parseInt(userId) : undefined);
    }
    get(id, user) {
        return this.service.getById(Number(id), user);
    }
    create(dto, user) {
        if (user?.userId) {
            dto.submittedBy = user.userId;
        }
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(Number(id), dto);
    }
    approve(id, dto) {
        return this.service.approve(Number(id), dto);
    }
    remove(id) {
        return this.service.remove(Number(id));
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('submittedBy')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __param(7, (0, common_1.Query)('type')),
    __param(8, (0, common_1.Query)('projectId')),
    __param(9, (0, common_1.Query)('dealId')),
    __param(10, (0, common_1.Query)('leadId')),
    __param(11, (0, common_1.Query)('currency')),
    __param(12, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), permissions_guard_1.PermissionsGuard),
    (0, permission_decorator_1.RequirePermission)('expense.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_expense_dto_1.UpdateExpenseDto]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), permissions_guard_1.PermissionsGuard),
    (0, permission_decorator_1.RequirePermission)('expense.approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_expense_dto_1.ApproveExpenseDto]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "approve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), permissions_guard_1.PermissionsGuard),
    (0, permission_decorator_1.RequirePermission)('expense.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "remove", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map