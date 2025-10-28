import { MessageStatus } from '@prisma/client';
interface SendWhatsAppOptions {
    to: string;
    content: string;
    leadId: number;
    userId: number;
    templateId?: number;
    mediaUrls?: string[];
}
export declare class WhatsAppService {
    private client;
    private config;
    constructor();
    private initializeFromEnv;
    initializeFromProvider(providerId: number): Promise<void>;
    private createClient;
    private formatPhoneNumber;
    sendWhatsApp(options: SendWhatsAppOptions): Promise<string>;
    sendTemplatedWhatsApp(templateId: number, leadId: number, userId: number, variables?: Record<string, any>): Promise<string>;
    sendWhatsAppWithMedia(options: SendWhatsAppOptions & {
        mediaUrls: string[];
    }): Promise<string>;
    getDeliveryStatus(messageId: number): Promise<MessageStatus>;
    testConnection(): Promise<boolean>;
    sendApprovedTemplate(templateName: string, to: string, parameters: string[], leadId: number, userId: number): Promise<string>;
}
export declare const whatsAppService: WhatsAppService;
export {};
//# sourceMappingURL=WhatsAppService.d.ts.map