import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TransferLeadDto {
  @IsOptional() @IsNumber() newUserId?: number | null;
  @IsOptional() @IsString() notes?: string;
}
