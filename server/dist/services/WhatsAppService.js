"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsAppService = exports.WhatsAppService = void 0;
const twilio_1 = require("twilio");
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
class WhatsAppService {
    constructor() {
        this.client = null;
        this.config = null;
        this.initializeFromEnv();
    }
    initializeFromEnv() {
        if (process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_WHATSAPP_FROM) {
            this.config = {
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN,
                fromNumber: process.env.TWILIO_WHATSAPP_FROM,
            };
            this.createClient();
        }
    }
    async initializeFromProvider(providerId) {
        try {
            const provider = await prisma_1.prisma.communicationProvider.findFirst({
                where: {
                    id: providerId,
                    type: client_1.TemplateType.WHATSAPP,
                    isActive: true,
                },
            });
            if (!provider) {
                throw new Error('WhatsApp provider not found or inactive');
            }
            const config = provider.config;
            this.config = {
                accountSid: config.accountSid,
                authToken: config.authToken,
                fromNumber: config.fromNumber,
            };
            this.createClient();
        }
        catch (error) {
            console.error('Error initializing WhatsApp provider:', error);
            throw error;
        }
    }
    createClient() {
        if (!this.config)
            return;
        this.client = new twilio_1.Twilio(this.config.accountSid, this.config.authToken);
    }
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');
        // Add country code if not present
        if (!cleaned.startsWith('1') && cleaned.length === 10) {
            cleaned = '1' + cleaned;
        }
        return `whatsapp:+${cleaned}`;
    }
    async sendWhatsApp(options) {
        if (!this.client || !this.config) {
            throw new Error('WhatsApp service not configured');
        }
        const formattedTo = this.formatPhoneNumber(options.to);
        const formattedFrom = this.formatPhoneNumber(this.config.fromNumber);
        // Create message record
        const message = await prisma_1.prisma.communicationMessage.create({
            data: {
                leadId: options.leadId,
                userId: options.userId,
                templateId: options.templateId,
                type: client_1.TemplateType.WHATSAPP,
                recipient: options.to,
                content: options.content,
                status: client_1.MessageStatus.PENDING,
            },
        });
        try {
            // Send WhatsApp message
            const twilioMessage = await this.client.messages.create({
                from: formattedFrom,
                to: formattedTo,
                body: options.content,
                mediaUrl: options.mediaUrls,
            });
            // Update message status
            await prisma_1.prisma.communicationMessage.update({
                where: { id: message.id },
                data: {
                    status: client_1.MessageStatus.SENT,
                    sentAt: new Date(),
                    externalId: twilioMessage.sid,
                },
            });
            // Create activity log
            await prisma_1.prisma.activity.create({
                data: {
                    title: 'WhatsApp message sent',
                    description: `WhatsApp message sent to ${options.to}`,
                    type: 'COMMUNICATION_LOGGED',
                    icon: 'FiMessageSquare',
                    iconColor: 'text-green-600',
                    userId: options.userId,
                    metadata: {
                        messageId: message.id,
                        leadId: options.leadId,
                        type: 'whatsapp',
                        twilioSid: twilioMessage.sid,
                    },
                },
            });
            return message.id.toString();
        }
        catch (error) {
            // Update message with error
            await prisma_1.prisma.communicationMessage.update({
                where: { id: message.id },
                data: {
                    status: client_1.MessageStatus.FAILED,
                    failedAt: new Date(),
                    errorMessage: error.message,
                },
            });
            throw error;
        }
    }
    async sendTemplatedWhatsApp(templateId, leadId, userId, variables = {}) {
        // Get template
        const template = await prisma_1.prisma.communicationTemplate.findFirst({
            where: {
                id: templateId,
                type: client_1.TemplateType.WHATSAPP,
                isActive: true,
            },
        });
        if (!template) {
            throw new Error('WhatsApp template not found or inactive');
        }
        // Get lead data
        const lead = await prisma_1.prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                assignedUser: true,
                source: true,
                companies: true,
            },
        });
        if (!lead) {
            throw new Error('Lead not found');
        }
        if (!lead.phone) {
            throw new Error('Lead phone number not found');
        }
        // Prepare template variables
        const templateVars = {
            leadFirstName: lead.firstName,
            leadLastName: lead.lastName,
            leadEmail: lead.email,
            leadPhone: lead.phone,
            leadCompany: lead.company,
            assignedUserName: lead.assignedUser
                ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                : '',
            assignedUserEmail: lead.assignedUser?.email || '',
            companyName: lead.companies?.name || 'WeConnect CRM',
            currentDate: new Date().toLocaleDateString(),
            currentYear: new Date().getFullYear().toString(),
            ...variables,
        };
        // Process template content
        let content = template.content;
        // Replace variables in content
        Object.entries(templateVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, String(value || ''));
        });
        // Send WhatsApp message
        return this.sendWhatsApp({
            to: lead.phone,
            content,
            leadId,
            userId,
            templateId,
        });
    }
    async sendWhatsAppWithMedia(options) {
        return this.sendWhatsApp(options);
    }
    async getDeliveryStatus(messageId) {
        const message = await prisma_1.prisma.communicationMessage.findUnique({
            where: { id: messageId },
        });
        if (!message || !message.externalId || !this.client) {
            return message?.status || client_1.MessageStatus.FAILED;
        }
        try {
            // Get message status from Twilio
            const twilioMessage = await this.client.messages(message.externalId).fetch();
            let status;
            switch (twilioMessage.status) {
                case 'queued':
                case 'accepted':
                    status = client_1.MessageStatus.PENDING;
                    break;
                case 'sent':
                    status = client_1.MessageStatus.SENT;
                    break;
                case 'delivered':
                    status = client_1.MessageStatus.DELIVERED;
                    break;
                case 'read':
                    status = client_1.MessageStatus.READ;
                    break;
                case 'failed':
                case 'undelivered':
                    status = client_1.MessageStatus.FAILED;
                    break;
                default:
                    status = client_1.MessageStatus.SENT;
            }
            // Update message status if changed
            if (status !== message.status) {
                await prisma_1.prisma.communicationMessage.update({
                    where: { id: messageId },
                    data: {
                        status,
                        deliveredAt: status === client_1.MessageStatus.DELIVERED ? new Date() : undefined,
                        readAt: status === client_1.MessageStatus.READ ? new Date() : undefined,
                    },
                });
            }
            return status;
        }
        catch (error) {
            console.error('Error fetching WhatsApp message status:', error);
            return message.status;
        }
    }
    async testConnection() {
        if (!this.client || !this.config) {
            return false;
        }
        try {
            // Test connection by fetching account info
            await this.client.api.accounts(this.config.accountSid).fetch();
            return true;
        }
        catch (error) {
            console.error('WhatsApp connection test failed:', error);
            return false;
        }
    }
    // WhatsApp Business API template methods (for approved templates)
    async sendApprovedTemplate(templateName, to, parameters, leadId, userId) {
        if (!this.client || !this.config) {
            throw new Error('WhatsApp service not configured');
        }
        const formattedTo = this.formatPhoneNumber(to);
        const formattedFrom = this.formatPhoneNumber(this.config.fromNumber);
        // Create message record
        const message = await prisma_1.prisma.communicationMessage.create({
            data: {
                leadId,
                userId,
                type: client_1.TemplateType.WHATSAPP,
                recipient: to,
                content: `Template: ${templateName}`,
                status: client_1.MessageStatus.PENDING,
                metadata: {
                    templateName,
                    parameters,
                },
            },
        });
        try {
            // Send approved template message
            const twilioMessage = await this.client.messages.create({
                from: formattedFrom,
                to: formattedTo,
                contentSid: templateName, // For approved templates
                contentVariables: JSON.stringify(parameters),
            });
            // Update message status
            await prisma_1.prisma.communicationMessage.update({
                where: { id: message.id },
                data: {
                    status: client_1.MessageStatus.SENT,
                    sentAt: new Date(),
                    externalId: twilioMessage.sid,
                },
            });
            return message.id.toString();
        }
        catch (error) {
            // Update message with error
            await prisma_1.prisma.communicationMessage.update({
                where: { id: message.id },
                data: {
                    status: client_1.MessageStatus.FAILED,
                    failedAt: new Date(),
                    errorMessage: error.message,
                },
            });
            throw error;
        }
    }
}
exports.WhatsAppService = WhatsAppService;
exports.whatsAppService = new WhatsAppService();
//# sourceMappingURL=WhatsAppService.js.map