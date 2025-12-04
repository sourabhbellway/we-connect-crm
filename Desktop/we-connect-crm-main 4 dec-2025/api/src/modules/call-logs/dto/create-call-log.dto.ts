import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCallLogDto {
  @IsNumber() leadId: number;
  @IsNumber() userId: number;
  @IsString() phoneNumber: string;
  @IsOptional() @IsString() callType?: string;
  @IsOptional() @IsString() callStatus?: string;
  @IsOptional() @IsNumber() duration?: number;
  @IsOptional() @IsDateString() startTime?: string;
  @IsOptional() @IsDateString() endTime?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() outcome?: string;
  @IsOptional() @IsString() recordingUrl?: string;
  @IsOptional() @IsBoolean() isAnswered?: boolean;
  @IsOptional() metadata?: Record<string, unknown>;
}
