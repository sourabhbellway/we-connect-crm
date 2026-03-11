import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LeadProductDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;
}

export class CreateLeadDto {
  // Basic - Now optional, validation will be dynamic based on field configs
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name must be at least 1 character' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'First name can only contain letters and spaces',
  })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name must be at least 1 character' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Last name can only contain letters and spaces',
  })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[0-9+\s()-]+$/, {
    message: 'Phone can only contain digits, spaces, +, -, (, )',
  })
  @MinLength(7, { message: 'Phone must be at least 7 characters' })
  @MaxLength(15, { message: 'Phone must not exceed 15 characters' })
  phone?: string;

  // Company
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @Type(() => Number) @IsNumber() companySize?: number;
  @IsOptional() @Type(() => Number) @IsNumber() annualRevenue?: number;

  // Location
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() zipCode?: string;

  // Contact & Social
  @IsOptional() @IsString() linkedinProfile?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional()
  @IsIn(['email', 'phone', 'sms', 'whatsapp', 'linkedin'])
  preferredContactMethod?: string;

  // Lead Management
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Source ID must be a number' })
  sourceId?: number;
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string; // maps to LeadStatus (uppercased)
  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'], {
    message: 'Priority must be one of: low, medium, high, urgent',
  })
  priority?: string; // maps to LeadPriority (uppercased)
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Assigned to ID must be a number' })
  assignedTo?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Owner ID must be a number' })
  ownerId?: number;

  // Business
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Budget must be a number' })
  budget?: number;
  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Lead score must be a number' })
  leadScore?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Product ID must be a number' })
  productId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadProductDto)
  products?: LeadProductDto[];

  // Notes and Tags
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() tags?: number[];

  // Timing
  @IsOptional() @IsDateString() lastContactedAt?: string;
  @IsOptional() @IsDateString() nextFollowUpAt?: string;

  // Custom Fields - Dynamic fields configured in business settings
  @IsOptional()
  customFields?: Record<string, any>;
}
