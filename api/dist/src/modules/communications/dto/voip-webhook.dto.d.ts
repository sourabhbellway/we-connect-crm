export declare class VoIPWebhookDto {
    callId: string;
    status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled';
    phoneNumber?: string;
    duration?: number;
    recordingUrl?: string;
    region?: 'india' | 'arabic';
    errorMessage?: string;
    errorCode?: string;
    isRecorded?: boolean;
    metadata?: Record<string, unknown>;
    timestamp?: string;
}
