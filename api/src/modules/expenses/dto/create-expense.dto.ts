import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsDateString() expenseDate: string;
  @Type(() => Number)
  @IsNumber()
  amount: number;
  @IsEnum([
    'TRAVEL',
    'MEALS',
    'ACCOMMODATION',
    'OFFICE_SUPPLIES',
    'UTILITIES',
    'MARKETING',
    'ENTERTAINMENT',
    'TRAINING',
    'EQUIPMENT',
    'SOFTWARE',
    'CONSULTING',
    'MISCELLANEOUS',
    'OTHER',
  ])
  type: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsOptional() @IsString() receiptUrl?: string;
  @Type(() => Number)
  @IsNumber()
  submittedBy: number;
  @IsOptional() @Type(() => Number) @IsNumber() projectId?: number;
  @IsOptional() @Type(() => Number) @IsNumber() dealId?: number;
  @IsOptional() @Type(() => Number) @IsNumber() leadId?: number;
  @IsOptional() @IsString() currency?: string;
}
