"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const event_emitter_1 = require("@nestjs/event-emitter");
const admin = __importStar(require("firebase-admin"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        if (!admin.apps.length) {
            try {
                const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
                if (serviceAccount) {
                    admin.initializeApp({
                        credential: admin.credential.cert(JSON.parse(serviceAccount)),
                    });
                    this.logger.log('Firebase Admin SDK initialized successfully');
                }
                else {
                    this.logger.warn('Firebase service account not configured. FCM push notifications will not work.');
                }
            }
            catch (error) {
                this.logger.error('Failed to initialize Firebase Admin SDK:', error);
            }
        }
    }
    async create(dto) {
        const shouldSend = await this.shouldSendNotification(dto.userId, dto.type);
        if (!shouldSend) {
            this.logger.log(`Notification skipped for user ${dto.userId}, type ${dto.type} (preferences)`);
            return { success: true, skipped: true };
        }
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                link: dto.link,
                metadata: dto.metadata,
            },
        });
        this.eventEmitter.emit('notification.created', {
            userId: dto.userId,
            notification,
        });
        this.logger.log(`Notification created: ${notification.id} for user ${dto.userId}`);
        return { success: true, data: notification };
    }
    async createBulk(dto) {
        const notifications = [];
        for (const userId of dto.userIds) {
            const shouldSend = await this.shouldSendNotification(userId, dto.type);
            if (shouldSend) {
                const notification = await this.prisma.notification.create({
                    data: {
                        userId,
                        type: dto.type,
                        title: dto.title,
                        message: dto.message,
                        link: dto.link,
                        metadata: dto.metadata,
                    },
                });
                this.eventEmitter.emit('notification.created', {
                    userId,
                    notification,
                });
                notifications.push(notification);
            }
        }
        this.logger.log(`Bulk notifications created: ${notifications.length} out of ${dto.userIds.length}`);
        return { success: true, data: { count: notifications.length } };
    }
    async findAll(userId, query) {
        const { type, read, page = 1, limit = 20 } = query;
        const where = { userId };
        if (type)
            where.type = type;
        if (read !== undefined)
            where.read = read;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
        ]);
        const unreadCount = await this.prisma.notification.count({
            where: { userId, read: false },
        });
        return {
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        };
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const updated = await this.prisma.notification.update({
            where: { id },
            data: { read: true, readAt: new Date() },
        });
        return { success: true, data: updated };
    }
    async markAllAsRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true, readAt: new Date() },
        });
        return { success: true, data: { count: result.count } };
    }
    async delete(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.prisma.notification.delete({ where: { id } });
        return { success: true, message: 'Notification deleted' };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, read: false },
        });
        return { success: true, data: { unreadCount: count } };
    }
    async getPreferences(userId) {
        let preferences = await this.prisma.notificationPreference.findUnique({
            where: { userId },
        });
        if (!preferences) {
            preferences = await this.prisma.notificationPreference.create({
                data: { userId },
            });
        }
        return { success: true, data: preferences };
    }
    async updatePreferences(userId, dto) {
        const existingPrefs = await this.prisma.notificationPreference.findUnique({
            where: { userId },
        });
        let preferences;
        if (existingPrefs) {
            const currentPrefs = existingPrefs.preferences || {};
            const newPrefs = dto.preferences
                ? { ...currentPrefs, ...dto.preferences }
                : currentPrefs;
            preferences = await this.prisma.notificationPreference.update({
                where: { userId },
                data: {
                    inAppEnabled: dto.inAppEnabled,
                    emailEnabled: dto.emailEnabled,
                    soundEnabled: dto.soundEnabled,
                    preferences: newPrefs,
                    doNotDisturbStart: dto.doNotDisturbStart,
                    doNotDisturbEnd: dto.doNotDisturbEnd,
                },
            });
        }
        else {
            preferences = await this.prisma.notificationPreference.create({
                data: {
                    userId,
                    inAppEnabled: dto.inAppEnabled ?? true,
                    emailEnabled: dto.emailEnabled ?? false,
                    soundEnabled: dto.soundEnabled ?? true,
                    preferences: dto.preferences,
                    doNotDisturbStart: dto.doNotDisturbStart,
                    doNotDisturbEnd: dto.doNotDisturbEnd,
                },
            });
        }
        return { success: true, data: preferences };
    }
    async shouldSendNotification(userId, type) {
        const prefs = await this.prisma.notificationPreference.findUnique({
            where: { userId },
        });
        if (!prefs) {
            return true;
        }
        if (!prefs.inAppEnabled) {
            return false;
        }
        if (prefs.doNotDisturbStart !== null && prefs.doNotDisturbEnd !== null) {
            const currentHour = new Date().getHours();
            const start = prefs.doNotDisturbStart;
            const end = prefs.doNotDisturbEnd;
            if (start <= end) {
                if (currentHour >= start && currentHour < end) {
                    return false;
                }
            }
            else {
                if (currentHour >= start || currentHour < end) {
                    return false;
                }
            }
        }
        const preferences = prefs.preferences || {};
        const typeKey = this.getPreferenceKey(type);
        if (typeKey && preferences[typeKey] === false) {
            return false;
        }
        return true;
    }
    getPreferenceKey(type) {
        const mapping = {
            LEAD_CREATED: 'leadCreated',
            LEAD_UPDATED: 'leadUpdated',
            LEAD_ASSIGNED: 'leadAssigned',
            LEAD_STATUS_CHANGED: 'leadUpdated',
            CLIENT_REPLY: 'clientReply',
            PAYMENT_ADDED: 'paymentAdded',
            PAYMENT_UPDATED: 'paymentUpdated',
            TASK_ASSIGNED: 'taskAssigned',
            TASK_DUE: 'taskDue',
            MEETING_SCHEDULED: 'meetingScheduled',
            FOLLOW_UP_DUE: 'followUpDue',
            DEAL_CREATED: 'dealCreated',
            DEAL_WON: 'dealWon',
            DEAL_LOST: 'dealLost',
            QUOTATION_SENT: 'quotationSent',
            QUOTATION_ACCEPTED: 'quotationAccepted',
            INVOICE_SENT: 'invoiceSent',
            INVOICE_PAID: 'invoicePaid',
            SYSTEM: 'system',
        };
        return mapping[type] || null;
    }
    async notifyLeadEvent(type, userId, leadId, leadName, additionalInfo) {
        const messages = {
            [client_1.NotificationType.LEAD_CREATED]: {
                title: 'New Lead Created',
                message: `A new lead "${leadName}" has been created${additionalInfo ? ': ' + additionalInfo : ''}`,
            },
            [client_1.NotificationType.LEAD_UPDATED]: {
                title: 'Lead Updated',
                message: `Lead "${leadName}" has been updated${additionalInfo ? ': ' + additionalInfo : ''}`,
            },
            [client_1.NotificationType.LEAD_ASSIGNED]: {
                title: 'Lead Assigned to You',
                message: `You have been assigned to lead "${leadName}"`,
            },
            [client_1.NotificationType.LEAD_STATUS_CHANGED]: {
                title: 'Lead Status Changed',
                message: `Lead "${leadName}" status changed${additionalInfo ? ' to ' + additionalInfo : ''}`,
            },
            [client_1.NotificationType.CLIENT_REPLY]: undefined,
            [client_1.NotificationType.PAYMENT_ADDED]: undefined,
            [client_1.NotificationType.PAYMENT_UPDATED]: undefined,
            [client_1.NotificationType.TASK_ASSIGNED]: undefined,
            [client_1.NotificationType.TASK_DUE]: undefined,
            [client_1.NotificationType.MEETING_SCHEDULED]: undefined,
            [client_1.NotificationType.FOLLOW_UP_DUE]: undefined,
            [client_1.NotificationType.DEAL_CREATED]: undefined,
            [client_1.NotificationType.DEAL_WON]: undefined,
            [client_1.NotificationType.DEAL_LOST]: undefined,
            [client_1.NotificationType.QUOTATION_SENT]: undefined,
            [client_1.NotificationType.QUOTATION_ACCEPTED]: undefined,
            [client_1.NotificationType.INVOICE_SENT]: undefined,
            [client_1.NotificationType.INVOICE_PAID]: undefined,
            [client_1.NotificationType.SYSTEM]: undefined,
        };
        const config = messages[type];
        if (!config)
            return;
        return this.create({
            userId,
            type,
            title: config.title,
            message: config.message,
            link: `/leads/${leadId}`,
            metadata: { leadId, leadName },
        });
    }
    async sendPushNotification(deviceToken, title, body, data) {
        try {
            if (!admin.apps.length) {
                this.logger.warn('Firebase not initialized. Cannot send push notification.');
                return false;
            }
            const message = {
                notification: {
                    title,
                    body,
                },
                data: data || {},
                token: deviceToken,
            };
            const response = await admin.messaging().send(message);
            this.logger.log(`Push notification sent successfully: ${response}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send push notification:', error);
            return false;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map