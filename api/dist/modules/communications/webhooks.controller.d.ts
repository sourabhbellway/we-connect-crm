import { CommunicationsService } from './communications.service';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';
import { EmailWebhookDto } from './dto/email-webhook.dto';
export declare class WebhooksController {
    private readonly service;
    constructor(service: CommunicationsService);
    handleWhatsAppWebhook(dto: WhatsAppWebhookDto): Promise<{
        success: boolean;
        message: string;
        data: {
            phone: string;
            messageId?: undefined;
            leadId?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            messageId: number;
            leadId: number;
            phone?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    handleEmailWebhook(dto: EmailWebhookDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            messageId?: undefined;
            leadId?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            messageId: number;
            leadId: number;
            email?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getWebhookUrls(): {
        success: boolean;
        data: {
            whatsapp: string;
            email: string;
            instructions: {
                whatsapp: string;
                email: string;
            };
        };
    };
}
