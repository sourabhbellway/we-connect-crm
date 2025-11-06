import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDecimal,
} from 'class-validator';

export class CreateExpenseDto {
  @IsDateString() expenseDate: string;
  @IsNumber() amount: number;
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
  @IsString() category: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsOptional() @IsString() receiptUrl?: string;
  @IsNumber() submittedBy: number;
  @IsOptional() @IsNumber() projectId?: number;
  @IsOptional() @IsNumber() dealId?: number;
  @IsOptional() @IsNumber() leadId?: number;
  @IsOptional() @IsString() currency?: string;
}
