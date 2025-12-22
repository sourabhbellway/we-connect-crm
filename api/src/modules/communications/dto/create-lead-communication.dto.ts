import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeadCommunicationDto {
  @IsNumber() leadId: number;
  @IsNumber() userId: number;
  @IsString() type: string;
  @IsOptional() @IsString() subject?: string;
  @IsString() content: string;
  @IsOptional() @IsString() direction?: string;
  @IsOptional() @IsNumber() duration?: number;
  @IsOptional() @IsString() outcome?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsDateString() completedAt?: string;
}
