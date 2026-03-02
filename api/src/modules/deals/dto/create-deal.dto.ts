import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDealDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Value must be a number' })
  value?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Probability must be a number' })
  probability?: number;

  @IsOptional()
  @IsString({ message: 'Expected close date must be a string' })
  expectedCloseDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Assigned to ID must be a number' })
  assignedTo?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'Contact ID must be a number' })
  contactId?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'Lead ID must be a number' })
  leadId?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'Company ID must be a number' })
  companyId?: number | null;
}
