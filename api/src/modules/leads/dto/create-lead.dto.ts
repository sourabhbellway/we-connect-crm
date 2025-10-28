import { IsEmail, IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export class CreateLeadDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() status?: string; // new/contacted/... (mapped to enum)
  @IsOptional() @IsNumber() sourceId?: number;
  @IsOptional() @IsNumber() assignedTo?: number;
  @IsOptional() @IsNumber() budget?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() tags?: number[];
}
