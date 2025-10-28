export declare class CreateLeadCommunicationDto {
    leadId: number;
    userId: number;
    type: string;
    subject?: string;
    content: string;
    direction?: string;
    duration?: number;
    outcome?: string;
    scheduledAt?: string;
    completedAt?: string;
}
