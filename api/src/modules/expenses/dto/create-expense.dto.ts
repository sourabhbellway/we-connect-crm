import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsDateString({}, { message: 'Expense date must be a valid date string' })
  @IsNotEmpty({ message: 'Expense date is required' })
  expenseDate: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsEnum(
    [
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
    ],
    {
      message:
        'Type must be one of: TRAVEL, MEALS, ACCOMMODATION, OFFICE_SUPPLIES, UTILITIES, MARKETING, ENTERTAINMENT, TRAINING, EQUIPMENT, SOFTWARE, CONSULTING, MISCELLANEOUS, OTHER',
    },
  )
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Remarks must be a string' })
  remarks?: string;

  @IsOptional()
  @IsString({ message: 'Receipt URL must be a string' })
  receiptUrl?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Submitted By must be a valid user ID' })
  @IsNotEmpty({ message: 'Submitted By (User ID) is required' })
  submittedBy: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Project ID must be a number' })
  projectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Deal ID must be a number' })
  dealId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Lead ID must be a number' })
  leadId?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency?: string;
}
