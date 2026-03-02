import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Priority must be one of: low, medium, high, urgent' })
  priority?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date string' })
  dueDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Assigned to ID must be a number' })
  assignedTo?: number;

  @IsNumber({}, { message: 'Created by ID must be a number' })
  @IsNotEmpty({ message: 'Creator ID is required' })
  createdBy: number;

  @IsOptional()
  @IsNumber({}, { message: 'Lead ID must be a number' })
  leadId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Deal ID must be a number' })
  dealId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Contact ID must be a number' })
  contactId?: number;
}
