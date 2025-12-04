import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendWhatsAppDto {
  @IsNumber() leadId: number;
  @IsString() to: string;
  @IsString() content: string;
  @IsOptional() @IsNumber() templateId?: number;
  @IsOptional() @IsArray() mediaUrls?: string[];
  @IsOptional() @IsNumber() userId?: number;
}
