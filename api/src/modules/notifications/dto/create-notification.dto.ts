import { IsString, IsOptional, IsEnum, IsObject, IsInt } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsInt()
  userId: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class BulkNotificationDto {
  @IsInt({ each: true })
  userIds: number[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
