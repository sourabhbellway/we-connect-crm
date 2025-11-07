import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ApproveExpenseDto {
  @IsEnum(['APPROVED', 'REJECTED']) status: string;
  @Type(() => Number)
  @IsNumber()
  reviewedBy: number;
  @IsOptional() @IsString() approvalRemarks?: string;
}
