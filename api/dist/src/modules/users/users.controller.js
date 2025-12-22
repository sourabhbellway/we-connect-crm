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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const passport_1 = require("@nestjs/passport");
const user_decorator_1 = require("../../common/decorators/user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    findAll(page, limit, search, status, isDeleted) {
        const isDeletedBool = isDeleted !== undefined && String(isDeleted).toLowerCase().trim() === 'true';
        return this.usersService.findAll({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            search,
            status,
            isDeleted: isDeletedBool,
        });
    }
    getStats() {
        return this.usersService.getStats();
    }
    getMyProfile(user) {
        if (!user?.userId && !user?.id)
            throw new common_1.BadRequestException('Invalid user context');
        const id = user.userId ?? user.id;
        return this.usersService.findOne(Number(id));
    }
    updateMyProfile(user, dto) {
        if (!user?.userId && !user?.id)
            throw new common_1.BadRequestException('Invalid user context');
        const id = user.userId ?? user.id;
        return this.usersService.updateProfile(Number(id), dto);
    }
    changeMyPassword(user, dto) {
        if (!user?.userId && !user?.id)
            throw new common_1.BadRequestException('Invalid user context');
        const id = user.userId ?? user.id;
        return this.usersService.changePasswordForUser(Number(id), dto.currentPassword, dto.newPassword);
    }
    changePasswordForNewUser(user, dto) {
        if (!user?.userId && !user?.id)
            throw new common_1.BadRequestException('Invalid user context');
        const id = user.userId ?? user.id;
        return this.usersService.changePasswordForNewUser(Number(id), dto.newPassword);
    }
    async uploadAvatar(user, file) {
        if (!user?.userId && !user?.id)
            throw new common_1.BadRequestException('Invalid user context');
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const id = user.userId ?? user.id;
        const fileName = file.filename;
        return this.usersService.updateAvatar(Number(id), fileName);
    }
    findOne(id) {
        return this.usersService.findOne(+id);
    }
    assignRoles(id, roleIds) {
        return this.usersService.assignRoles(Number(id), roleIds || []);
    }
    update(id, dto) {
        return this.usersService.update(Number(id), dto);
    }
    create(dto) {
        return this.usersService.create(dto);
    }
    remove(id) {
        return this.usersService.remove(Number(id));
    }
    restore(id) {
        return this.usersService.restore(Number(id));
    }
    deletePermanently(id) {
        return this.usersService.deletePermanently(Number(id));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('isDeleted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Put)('password'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changeMyPassword", null);
__decorate([
    (0, common_1.Put)('password/new-user'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePasswordForNewUser", null);
__decorate([
    (0, common_1.Post)('profile/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: 'uploads',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `avatar-${unique}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('roleIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRoles", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/restore'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deletePermanently", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map