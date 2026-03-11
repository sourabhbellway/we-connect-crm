import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateActivityDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString({ message: 'Type must be a string' })
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  @IsOptional()
  @IsString({ message: 'Icon must be a string' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'Icon color must be a string' })
  iconColor?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  userId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Super Admin ID must be a number' })
  superAdminId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Lead ID must be a number' })
  leadId?: number;
}
