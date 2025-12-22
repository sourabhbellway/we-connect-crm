export declare class SendEmailDto {
    leadId: number;
    to: string;
    subject: string;
    content: string;
    html?: string;
    templateId?: number;
    userId?: number;
}
