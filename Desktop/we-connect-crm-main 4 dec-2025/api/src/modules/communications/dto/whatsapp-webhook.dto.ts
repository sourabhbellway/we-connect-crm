import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class WhatsAppWebhookDto {
  @IsString()
  from: string; // Phone number of sender

  @IsString()
  @IsOptional()
  to?: string; // Business phone number

  @IsString()
  content: string; // Message content

  @IsString()
  @IsOptional()
  messageId?: string; // External message ID from WhatsApp provider

  @IsString()
  @IsOptional()
  timestamp?: string; // ISO timestamp from provider

  @IsString()
  @IsOptional()
  messageType?: string; // text, image, video, audio, document

  @IsArray()
  @IsOptional()
  mediaUrls?: string[]; // URLs of media attachments

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>; // Additional provider-specific data

  @IsString()
  @IsOptional()
  contactName?: string; // Contact name if provided by WhatsApp
}
