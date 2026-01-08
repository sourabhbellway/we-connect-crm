import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class VoIPCallLogDto {
    @IsNumber()
    leadId: number;

    @IsNumber()
    userId: number;

    @IsString()
    callId: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    callType: 'audio' | 'video';

    @IsString()
    status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled';

    @IsOptional()
    @IsNumber()
    duration?: number;

    @IsOptional()
    @IsString()
    startTime?: string;

    @IsOptional()
    @IsString()
    endTime?: string;

    @IsOptional()
    @IsString()
    recordingUrl?: string;

    @IsOptional()
    @IsString()
    region?: 'india' | 'arabic';

    @IsOptional()
    @IsBoolean()
    isRecorded?: boolean;

    @IsOptional()
    @IsString()
    errorMessage?: string;

    @IsOptional()
    @IsString()
    errorCode?: string;

    @IsOptional()
    metadata?: Record<string, unknown>;
}
