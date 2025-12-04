import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContactDataDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() notes?: string;
}

class CompanyDataDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() domain?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsNumber() industryId?: number;
}

class DealDataDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() value?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() probability?: number;
  @IsOptional() @IsString() expectedCloseDate?: string;
}

export class ConvertLeadDto {
  @IsBoolean() createContact: boolean;
  @IsBoolean() createCompany: boolean;
  @IsBoolean() createDeal: boolean;

  @ValidateNested()
  @Type(() => ContactDataDto)
  @IsOptional()
  contactData?: ContactDataDto;
  @ValidateNested()
  @Type(() => CompanyDataDto)
  @IsOptional()
  companyData?: CompanyDataDto;
  @ValidateNested()
  @Type(() => DealDataDto)
  @IsOptional()
  dealData?: DealDataDto;
}
