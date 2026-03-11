import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  BulkNotificationDto,
} from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

interface NotificationEvent {
  userId: number;
  notification: any;
}

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NotificationsController {
  // Store active SSE connections per user
  private userStreams = new Map<number, Subject<MessageEvent>>();

  constructor(private readonly notificationsService: NotificationsService) {}

  // Get all notifications for current user
  @Get()
  @RequirePermission('notifications.read')
  async getNotifications(
    @Req() req: any,
    @Query() query: QueryNotificationsDto,
  ) {
    const userId = req.user.userId;
    return this.notificationsService.findAll(userId, query);
  }

  // Get unread count
  @Get('unread-count')
  @RequirePermission('notifications.read')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.getUnreadCount(userId);
  }

  // Mark single notification as read
  @Patch(':id/read')
  @RequirePermission('notifications.update')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.markAsRead(+id, userId);
  }

  // Mark all notifications as read
  @Patch('mark-all-read')
  @RequirePermission('notifications.update')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }

  // Delete notification
  @Delete(':id')
  @RequirePermission('notifications.delete')
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.delete(+id, userId);
  }

  // Create notification (admin/system use)
  @Post()
  @RequirePermission('notifications.update')
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  // Create bulk notifications
  @Post('bulk')
  @RequirePermission('notifications.update')
  async createBulkNotifications(@Body() dto: BulkNotificationDto) {
    return this.notificationsService.createBulk(dto);
  }

  // Get notification preferences
  @Get('preferences')
  @RequirePermission('notifications.read')
  async getPreferences(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.getPreferences(userId);
  }

  // Update notification preferences
  @Patch('preferences')
  @RequirePermission('notifications.update')
  async updatePreferences(
    @Req() req: any,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    const userId = req.user.userId;
    return this.notificationsService.updatePreferences(userId, dto);
  }

  // Server-Sent Events endpoint for real-time notifications
  @Sse('stream')
  @RequirePermission('notifications.read')
  streamNotifications(@Req() req: any): Observable<MessageEvent> {
    const userId = req.user.userId;

    // Create a new subject for this user if it doesn't exist
    if (!this.userStreams.has(userId)) {
      this.userStreams.set(userId, new Subject<MessageEvent>());
    }

    const userStream = this.userStreams.get(userId)!;

    // Send initial connection message
    setTimeout(() => {
      userStream.next({
        data: { type: 'connected', message: 'Notification stream connected' },
      } as MessageEvent);
    }, 0);

    return userStream.asObservable();
  }

  // Listen for notification.created events and push to appropriate user streams
  @OnEvent('notification.created')
  handleNotificationCreated(payload: NotificationEvent) {
    const { userId, notification } = payload;
    const userStream = this.userStreams.get(userId);

    if (userStream) {
      userStream.next({
        data: {
          type: 'notification',
          notification,
        },
      } as MessageEvent);
    }
  }
}
