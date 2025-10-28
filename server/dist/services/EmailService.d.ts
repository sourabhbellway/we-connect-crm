import { MessageStatus } from '@prisma/client';
interface SendEmailOptions {
    to: string;
    subject: string;
    content: string;
    html?: string;
    leadId: number;
    userId: number;
    templateId?: number;
}
export declare class EmailService {
    private transporter;
    private config;
    constructor();
    private initializeFromEnv;
    initializeFromProvider(providerId: number): Promise<void>;
    private createTransporter;
    sendEmail(options: SendEmailOptions): Promise<string>;
    sendTemplatedEmail(templateId: number, leadId: number, userId: number, variables?: Record<string, any>): Promise<string>;
    testConnection(): Promise<boolean>;
    getDeliveryStatus(messageId: number): Promise<MessageStatus>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=EmailService.d.ts.map