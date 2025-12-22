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
exports.BulkNotificationDto = exports.CreateNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateNotificationDto {
    userId;
    type;
    title;
    message;
    link;
    metadata;
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "link", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "metadata", void 0);
class BulkNotificationDto {
    userIds;
    type;
    title;
    message;
    link;
    metadata;
}
exports.BulkNotificationDto = BulkNotificationDto;
__decorate([
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkNotificationDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.NotificationType),
    __metadata("design:type", String)
], BulkNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkNotificationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkNotificationDto.prototype, "link", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BulkNotificationDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-notification.dto.js.map