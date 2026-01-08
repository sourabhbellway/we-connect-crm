export declare class InitiateVoIPCallDto {
    leadId: number;
    userId: number;
    phoneNumber: string;
    callType: 'audio' | 'video';
    region?: 'india' | 'arabic';
    recordCall?: boolean;
    customData?: string;
    metadata?: Record<string, unknown>;
}
