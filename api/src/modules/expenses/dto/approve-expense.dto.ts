import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApproveExpenseDto {
  @IsEnum(['APPROVED', 'REJECTED']) status: string;
  @IsNumber() reviewedBy: number;
  @IsOptional() @IsString() approvalRemarks?: string;
}
