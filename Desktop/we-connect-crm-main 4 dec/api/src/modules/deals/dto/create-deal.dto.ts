import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateDealDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() value?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() probability?: number;
  @IsOptional() @IsString() expectedCloseDate?: string;
  @IsOptional() @IsNumber() assignedTo?: number | null;
  @IsOptional() @IsNumber() contactId?: number | null;
  @IsOptional() @IsNumber() leadId?: number | null;
  @IsOptional() @IsNumber() companyId?: number | null;
}
