export declare class WhatsAppWebhookDto {
    from: string;
    to?: string;
    content: string;
    messageId?: string;
    timestamp?: string;
    messageType?: string;
    mediaUrls?: string[];
    metadata?: Record<string, any>;
    contactName?: string;
}
