import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SendTemplatedDto {
  @IsNumber() templateId: number;
  @IsNumber() leadId: number;
  @IsOptional() variables?: Record<string, unknown>;
  @IsOptional() @IsNumber() userId?: number;
}
