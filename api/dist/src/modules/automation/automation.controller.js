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
exports.AutomationController = void 0;
const common_1 = require("@nestjs/common");
const automation_service_1 = require("./automation.service");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
const update_workflow_dto_1 = require("./dto/update-workflow.dto");
const passport_1 = require("@nestjs/passport");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permission_decorator_1 = require("../../common/decorators/permission.decorator");
let AutomationController = class AutomationController {
    automationService;
    constructor(automationService) {
        this.automationService = automationService;
    }
    create(createWorkflowDto, req) {
        const userId = req.user?.userId;
        return this.automationService.create(createWorkflowDto, userId);
    }
    findAll(includeInactive) {
        return this.automationService.findAll(includeInactive === 'true');
    }
    findOne(id) {
        return this.automationService.findOne(+id);
    }
    update(id, updateWorkflowDto) {
        return this.automationService.update(+id, updateWorkflowDto);
    }
    remove(id) {
        return this.automationService.remove(+id);
    }
    toggleActive(id, isActive) {
        return this.automationService.toggleActive(+id, isActive);
    }
    executeWorkflow(id, triggerData) {
        return this.automationService.executeWorkflow(+id, triggerData);
    }
    getExecutionHistory(workflowId, limit) {
        return this.automationService.getExecutionHistory(workflowId ? +workflowId : undefined, limit ? +limit : 50);
    }
};
exports.AutomationController = AutomationController;
__decorate([
    (0, common_1.Post)('workflows'),
    (0, permission_decorator_1.RequirePermission)('automation.create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workflow_dto_1.CreateWorkflowDto, Object]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('workflows'),
    (0, permission_decorator_1.RequirePermission)('automation.read'),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('workflows/:id'),
    (0, permission_decorator_1.RequirePermission)('automation.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('workflows/:id'),
    (0, permission_decorator_1.RequirePermission)('automation.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_workflow_dto_1.UpdateWorkflowDto]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('workflows/:id'),
    (0, permission_decorator_1.RequirePermission)('automation.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('workflows/:id/toggle'),
    (0, permission_decorator_1.RequirePermission)('automation.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Post)('workflows/:id/execute'),
    (0, permission_decorator_1.RequirePermission)('automation.create'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "executeWorkflow", null);
__decorate([
    (0, common_1.Get)('executions'),
    (0, permission_decorator_1.RequirePermission)('automation.read'),
    __param(0, (0, common_1.Query)('workflowId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "getExecutionHistory", null);
exports.AutomationController = AutomationController = __decorate([
    (0, common_1.Controller)('automation'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [automation_service_1.AutomationService])
], AutomationController);
//# sourceMappingURL=automation.controller.js.map