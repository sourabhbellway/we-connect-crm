import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitiateVoIPCallDto {
    @IsNumber()
    leadId: number;

    @IsNumber()
    userId: number;

    @IsString()
    phoneNumber: string;

    @IsString()
    callType: 'audio' | 'video' = 'audio';

    @IsOptional()
    @IsString()
    region?: 'india' | 'arabic';

    @IsOptional()
    @IsBoolean()
    recordCall?: boolean;

    @IsOptional()
    @IsString()
    customData?: string;

    @IsOptional()
    metadata?: Record<string, unknown>;
}
