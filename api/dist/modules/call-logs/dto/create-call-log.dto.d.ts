export declare class CreateCallLogDto {
    leadId: number;
    userId: number;
    phoneNumber: string;
    callType?: string;
    callStatus?: string;
    duration?: number;
    startTime?: string;
    endTime?: string;
    notes?: string;
    outcome?: string;
    recordingUrl?: string;
    isAnswered?: boolean;
    metadata?: Record<string, unknown>;
}
