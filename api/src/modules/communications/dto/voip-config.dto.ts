import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class VoIPConfigDto {
    @IsString()
    provider: string;

    @IsString()
    apiKey: string;

    @IsString()
    apiSecret: string;

    @IsOptional()
    @IsString()
    accountSid?: string;

    @IsOptional()
    @IsString()
    authToken?: string;

    @IsArray()
    @IsString({ each: true })
    regions: string[];

    @IsOptional()
    @IsString()
    defaultRegion?: 'india' | 'arabic';

    @IsOptional()
    @IsBoolean()
    enableCallRecording?: boolean;

    @IsOptional()
    @IsString()
    recordingStorage?: 's3' | 'local' | 'none';

    @IsOptional()
    @IsBoolean()
    enableVideoCalls?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    metadata?: Record<string, unknown>;
}
