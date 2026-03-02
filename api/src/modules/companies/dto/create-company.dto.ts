import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Domain must be a string' })
  domain?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Industry ID must be a number' })
  industryId?: number;
}
