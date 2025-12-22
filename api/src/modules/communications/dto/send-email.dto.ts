import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsNumber() leadId: number;
  @IsString() to: string;
  @IsString() subject: string;
  @IsString() content: string;
  @IsOptional() @IsString() html?: string;
  @IsOptional() @IsNumber() templateId?: number;
  @IsOptional() @IsNumber() userId?: number;
}
