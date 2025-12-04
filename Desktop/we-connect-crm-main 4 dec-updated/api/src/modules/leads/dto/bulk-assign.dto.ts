import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class BulkAssignDto {
  @IsArray() leadIds: number[];
  @IsOptional() @IsNumber() newUserId?: number | null;
}
