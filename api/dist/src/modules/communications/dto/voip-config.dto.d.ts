export declare class VoIPConfigDto {
    provider: string;
    apiKey: string;
    apiSecret: string;
    accountSid?: string;
    authToken?: string;
    regions: string[];
    defaultRegion?: 'india' | 'arabic';
    enableCallRecording?: boolean;
    recordingStorage?: 's3' | 'local' | 'none';
    enableVideoCalls?: boolean;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
}
