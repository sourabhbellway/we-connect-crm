import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  // Basic
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;

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
  @IsOptional() @Type(() => Number) @IsNumber() sourceId?: number;
  @IsOptional() @IsString() status?: string; // maps to LeadStatus (uppercased)
  @IsOptional() @IsIn(['low', 'medium', 'high', 'urgent']) priority?: string; // maps to LeadPriority (uppercased)
  @IsOptional() @Type(() => Number) @IsNumber() assignedTo?: number;

  // Business
  @IsOptional() @Type(() => Number) @IsNumber() budget?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @Type(() => Number) @IsNumber() leadScore?: number;

  // Notes and Tags
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() tags?: number[];

  // Timing
  @IsOptional() @IsDateString() lastContactedAt?: string;
  @IsOptional() @IsDateString() nextFollowUpAt?: string;
}
