import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsString() type: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() iconColor?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() metadata?: Record<string, unknown>;
  @IsOptional() @IsNumber() userId?: number;
  @IsOptional() @IsNumber() superAdminId?: number;
  
  // YE LINE ADD KAREIN
  @IsOptional() @IsNumber() leadId?: number;
}
