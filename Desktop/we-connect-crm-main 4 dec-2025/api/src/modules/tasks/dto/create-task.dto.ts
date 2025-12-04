import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsNumber() assignedTo?: number;
  @IsNumber() createdBy: number;
  @IsOptional() @IsNumber() leadId?: number;
  @IsOptional() @IsNumber() dealId?: number;
  @IsOptional() @IsNumber() contactId?: number;
}
