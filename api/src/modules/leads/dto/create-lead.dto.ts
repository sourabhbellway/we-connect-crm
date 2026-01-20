import { IsOptional, IsString, IsNumber, IsArray, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

// All fields are optional - validation is handled dynamically based on field configs
export class CreateLeadDto {
  // Basic
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() firstNameAr?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() lastNameAr?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;

  // Company
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() companyAr?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @Type(() => Number) @IsNumber() companySize?: number;
  @IsOptional() @Type(() => Number) @IsNumber() annualRevenue?: number;

  // Location
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() addressAr?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() zipCode?: string;

  // Contact & Social
  @IsOptional() @IsString() linkedinProfile?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsIn(['email', 'phone', 'sms', 'whatsapp', 'linkedin']) preferredContactMethod?: string;

  // Lead Management
  @IsOptional() @Type(() => Number) @IsNumber() sourceId?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsIn(['low', 'medium', 'high', 'urgent']) priority?: string;
  @IsOptional() @IsIn(['SERVICE_LEAD', 'SALES_LEAD']) leadType?: string;
  @IsOptional() @IsIn(['FIXED_CUSTOMER', 'ON_CALL_CUSTOMER', 'WALK_IN_CUSTOMER']) customerType?: string;
  @IsOptional() @Type(() => Number) @IsNumber() assignedTo?: number;

  // Business
  @IsOptional() @Type(() => Number) @IsNumber() budget?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @Type(() => Number) @IsNumber() leadScore?: number;

  // Notes and Tags
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() tags?: number[];
  @IsOptional() @IsArray() productIds?: number[];

  // Timing
  @IsOptional() @IsDateString() lastContactedAt?: string;
  @IsOptional() @IsDateString() nextFollowUpAt?: string;

  // Custom Fields
  @IsOptional() customFields?: Record<string, any>;

  // Service Interest Fields
  @IsOptional() @IsString() primaryServiceCategory?: string;
  @IsOptional() @IsString() wasteCategory?: string;
  @IsOptional() @IsArray() servicePreference?: string[];
  @IsOptional() @IsString() serviceFrequency?: string;
  @IsOptional() @IsDateString() expectedStartDate?: string;
  @IsOptional() @IsString() urgencyLevel?: string;

  // Commercial Expectation Fields
  @IsOptional() @IsString() billingPreference?: string;
  @IsOptional() @Type(() => Number) @IsNumber() estimatedJobDuration?: number;
}

