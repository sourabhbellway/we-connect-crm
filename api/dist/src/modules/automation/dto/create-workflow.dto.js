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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkflowDto = exports.WorkflowActionDto = exports.WorkflowConditionGroupDto = exports.WorkflowConditionDto = exports.ActionType = exports.ConditionLogic = exports.ConditionOperator = exports.WorkflowTrigger = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var WorkflowTrigger;
(function (WorkflowTrigger) {
    WorkflowTrigger["LEAD_CREATED"] = "LEAD_CREATED";
    WorkflowTrigger["LEAD_UPDATED"] = "LEAD_UPDATED";
    WorkflowTrigger["LEAD_STATUS_CHANGED"] = "LEAD_STATUS_CHANGED";
    WorkflowTrigger["LEAD_ASSIGNED"] = "LEAD_ASSIGNED";
    WorkflowTrigger["DEAL_CREATED"] = "DEAL_CREATED";
    WorkflowTrigger["DEAL_UPDATED"] = "DEAL_UPDATED";
    WorkflowTrigger["DEAL_STAGE_CHANGED"] = "DEAL_STAGE_CHANGED";
    WorkflowTrigger["TASK_CREATED"] = "TASK_CREATED";
    WorkflowTrigger["TASK_COMPLETED"] = "TASK_COMPLETED";
})(WorkflowTrigger || (exports.WorkflowTrigger = WorkflowTrigger = {}));
var ConditionOperator;
(function (ConditionOperator) {
    ConditionOperator["EQUALS"] = "EQUALS";
    ConditionOperator["NOT_EQUALS"] = "NOT_EQUALS";
    ConditionOperator["CONTAINS"] = "CONTAINS";
    ConditionOperator["NOT_CONTAINS"] = "NOT_CONTAINS";
    ConditionOperator["GREATER_THAN"] = "GREATER_THAN";
    ConditionOperator["LESS_THAN"] = "LESS_THAN";
    ConditionOperator["GREATER_THAN_OR_EQUAL"] = "GREATER_THAN_OR_EQUAL";
    ConditionOperator["LESS_THAN_OR_EQUAL"] = "LESS_THAN_OR_EQUAL";
    ConditionOperator["IS_EMPTY"] = "IS_EMPTY";
    ConditionOperator["IS_NOT_EMPTY"] = "IS_NOT_EMPTY";
})(ConditionOperator || (exports.ConditionOperator = ConditionOperator = {}));
var ConditionLogic;
(function (ConditionLogic) {
    ConditionLogic["AND"] = "AND";
    ConditionLogic["OR"] = "OR";
})(ConditionLogic || (exports.ConditionLogic = ConditionLogic = {}));
var ActionType;
(function (ActionType) {
    ActionType["ASSIGN_TO_USER"] = "ASSIGN_TO_USER";
    ActionType["ASSIGN_TO_TEAM"] = "ASSIGN_TO_TEAM";
    ActionType["CHANGE_STATUS"] = "CHANGE_STATUS";
    ActionType["SEND_EMAIL"] = "SEND_EMAIL";
    ActionType["SEND_WHATSAPP"] = "SEND_WHATSAPP";
    ActionType["CREATE_TASK"] = "CREATE_TASK";
    ActionType["ADD_TAG"] = "ADD_TAG";
    ActionType["REMOVE_TAG"] = "REMOVE_TAG";
    ActionType["UPDATE_FIELD"] = "UPDATE_FIELD";
    ActionType["SEND_WEBHOOK"] = "SEND_WEBHOOK";
})(ActionType || (exports.ActionType = ActionType = {}));
class WorkflowConditionDto {
    field;
    operator;
    value;
}
exports.WorkflowConditionDto = WorkflowConditionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WorkflowConditionDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ConditionOperator),
    __metadata("design:type", String)
], WorkflowConditionDto.prototype, "operator", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WorkflowConditionDto.prototype, "value", void 0);
class WorkflowConditionGroupDto {
    logic;
    conditions;
}
exports.WorkflowConditionGroupDto = WorkflowConditionGroupDto;
__decorate([
    (0, class_validator_1.IsEnum)(ConditionLogic),
    __metadata("design:type", String)
], WorkflowConditionGroupDto.prototype, "logic", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowConditionDto),
    __metadata("design:type", Array)
], WorkflowConditionGroupDto.prototype, "conditions", void 0);
class WorkflowActionDto {
    type;
    config;
}
exports.WorkflowActionDto = WorkflowActionDto;
__decorate([
    (0, class_validator_1.IsEnum)(ActionType),
    __metadata("design:type", String)
], WorkflowActionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WorkflowActionDto.prototype, "config", void 0);
class CreateWorkflowDto {
    name;
    description;
    isActive;
    trigger;
    triggerData;
    conditions;
    actions;
}
exports.CreateWorkflowDto = CreateWorkflowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateWorkflowDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(WorkflowTrigger),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "trigger", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateWorkflowDto.prototype, "triggerData", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkflowConditionGroupDto),
    __metadata("design:type", WorkflowConditionGroupDto)
], CreateWorkflowDto.prototype, "conditions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowActionDto),
    __metadata("design:type", Array)
], CreateWorkflowDto.prototype, "actions", void 0);
//# sourceMappingURL=create-workflow.dto.js.map