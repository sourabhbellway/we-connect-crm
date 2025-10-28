import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateContactDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() assignedTo?: number | null;
  @IsOptional() @IsNumber() companyId?: number | null;
}
