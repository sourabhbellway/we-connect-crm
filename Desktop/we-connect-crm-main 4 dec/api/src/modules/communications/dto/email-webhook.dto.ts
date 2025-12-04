import { IsString, IsOptional, IsEmail, IsObject, IsArray } from 'class-validator';

export class EmailWebhookDto {
  @IsEmail()
  from: string; // Sender email address

  @IsString()
  @IsOptional()
  fromName?: string; // Sender name

  @IsEmail()
  @IsOptional()
  to?: string; // Recipient email (your business email)

  @IsString()
  subject: string; // Email subject

  @IsString()
  content: string; // Email body (HTML or plain text)

  @IsString()
  @IsOptional()
  textContent?: string; // Plain text version

  @IsString()
  @IsOptional()
  htmlContent?: string; // HTML version

  @IsString()
  @IsOptional()
  messageId?: string; // External message ID from email provider

  @IsString()
  @IsOptional()
  inReplyTo?: string; // Message ID of the email being replied to

  @IsString()
  @IsOptional()
  references?: string; // Thread references

  @IsString()
  @IsOptional()
  timestamp?: string; // ISO timestamp

  @IsArray()
  @IsOptional()
  attachments?: Array<{
    filename: string;
    contentType: string;
    url: string;
    size?: number;
  }>; // Email attachments

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>; // Additional provider-specific data

  @IsArray()
  @IsOptional()
  cc?: string[]; // CC recipients

  @IsArray()
  @IsOptional()
  bcc?: string[]; // BCC recipients
}
