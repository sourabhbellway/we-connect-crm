import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeadImportBatchDto {
  @IsOptional() @IsString() fileName?: string;
  @IsNumber() createdBy: number;
  @IsArray() records: Record<string, unknown>[];
}
