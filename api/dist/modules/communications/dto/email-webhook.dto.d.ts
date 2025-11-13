export declare class EmailWebhookDto {
    from: string;
    fromName?: string;
    to?: string;
    subject: string;
    content: string;
    textContent?: string;
    htmlContent?: string;
    messageId?: string;
    inReplyTo?: string;
    references?: string;
    timestamp?: string;
    attachments?: Array<{
        filename: string;
        contentType: string;
        url: string;
        size?: number;
    }>;
    metadata?: Record<string, any>;
    cc?: string[];
    bcc?: string[];
}
