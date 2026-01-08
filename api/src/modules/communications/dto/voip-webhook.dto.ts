import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class VoIPWebhookDto {
    @IsString()
    callId: string;

    @IsString()
    status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled';

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsNumber()
    duration?: number;

    @IsOptional()
    @IsString()
    recordingUrl?: string;

    @IsOptional()
    @IsString()
    region?: 'india' | 'arabic';

    @IsOptional()
    @IsString()
    errorMessage?: string;

    @IsOptional()
    @IsString()
    errorCode?: string;

    @IsOptional()
    @IsBoolean()
    isRecorded?: boolean;

    @IsOptional()
    metadata?: Record<string, unknown>;

    @IsOptional()
    @IsString()
    timestamp?: string;
}
