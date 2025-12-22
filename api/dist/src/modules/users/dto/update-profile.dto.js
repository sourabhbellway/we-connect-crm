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
exports.UpdateProfileDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const LETTERS_ONLY_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const NAME_RULE_MESSAGE = 'must contain only letters (A-Z), no numbers or special characters, and be at least 2 characters long';
class UpdateProfileDto {
    firstName;
    lastName;
    email;
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.Length)(2, 100, {
        message: 'First name ' + NAME_RULE_MESSAGE,
    }),
    (0, class_validator_1.Matches)(LETTERS_ONLY_REGEX, {
        message: 'First name ' + NAME_RULE_MESSAGE,
    }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.Length)(2, 100, {
        message: 'Last name ' + NAME_RULE_MESSAGE,
    }),
    (0, class_validator_1.Matches)(LETTERS_ONLY_REGEX, {
        message: 'Last name ' + NAME_RULE_MESSAGE,
    }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "email", void 0);
//# sourceMappingURL=update-profile.dto.js.map