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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const notifications_service_1 = require("./notifications.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const query_notifications_dto_1 = require("./dto/query-notifications.dto");
const notification_preference_dto_1 = require("./dto/notification-preference.dto");
const event_emitter_1 = require("@nestjs/event-emitter");
const rxjs_1 = require("rxjs");
let NotificationsController = class NotificationsController {
    notificationsService;
    userStreams = new Map();
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getNotifications(req, query) {
        const userId = req.user.userId;
        return this.notificationsService.findAll(userId, query);
    }
    async getUnreadCount(req) {
        const userId = req.user.userId;
        return this.notificationsService.getUnreadCount(userId);
    }
    async markAsRead(id, req) {
        const userId = req.user.userId;
        return this.notificationsService.markAsRead(+id, userId);
    }
    async markAllAsRead(req) {
        const userId = req.user.userId;
        return this.notificationsService.markAllAsRead(userId);
    }
    async deleteNotification(id, req) {
        const userId = req.user.userId;
        return this.notificationsService.delete(+id, userId);
    }
    async createNotification(dto) {
        return this.notificationsService.create(dto);
    }
    async createBulkNotifications(dto) {
        return this.notificationsService.createBulk(dto);
    }
    async getPreferences(req) {
        const userId = req.user.userId;
        return this.notificationsService.getPreferences(userId);
    }
    async updatePreferences(req, dto) {
        const userId = req.user.userId;
        return this.notificationsService.updatePreferences(userId, dto);
    }
    streamNotifications(req) {
        const userId = req.user.userId;
        if (!this.userStreams.has(userId)) {
            this.userStreams.set(userId, new rxjs_1.Subject());
        }
        const userStream = this.userStreams.get(userId);
        setTimeout(() => {
            userStream.next({
                data: { type: 'connected', message: 'Notification stream connected' },
            });
        }, 0);
        return userStream.asObservable();
    }
    handleNotificationCreated(payload) {
        const { userId, notification } = payload;
        const userStream = this.userStreams.get(userId);
        if (userStream) {
            userStream.next({
                data: {
                    type: 'notification',
                    notification,
                },
            });
        }
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_notifications_dto_1.QueryNotificationsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.BulkNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createBulkNotifications", null);
__decorate([
    (0, common_1.Get)('preferences'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Patch)('preferences'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_preference_dto_1.UpdateNotificationPreferenceDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Sse)('stream'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], NotificationsController.prototype, "streamNotifications", null);
__decorate([
    (0, event_emitter_1.OnEvent)('notification.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "handleNotificationCreated", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map