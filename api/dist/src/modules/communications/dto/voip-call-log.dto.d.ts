export declare class VoIPCallLogDto {
    leadId: number;
    userId: number;
    callId: string;
    phoneNumber: string;
    callType: 'audio' | 'video';
    status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled';
    duration?: number;
    startTime?: string;
    endTime?: string;
    recordingUrl?: string;
    region?: 'india' | 'arabic';
    isRecorded?: boolean;
    errorMessage?: string;
    errorCode?: string;
    metadata?: Record<string, unknown>;
}
