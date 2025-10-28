"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
        this.initializeFromEnv();
    }
    initializeFromEnv() {
        if (process.env.EMAIL_HOST &&
            process.env.EMAIL_PORT &&
            process.env.EMAIL_USER &&
            process.env.EMAIL_PASS &&
            process.env.EMAIL_FROM) {
            this.config = {
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT),
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                fromEmail: process.env.EMAIL_FROM,
                fromName: process.env.EMAIL_FROM_NAME || 'WeConnect CRM',
            };
            this.createTransporter();
        }
    }
    async initializeFromProvider(providerId) {
        try {
            const provider = await prisma_1.prisma.communicationProvider.findFirst({
                where: {
                    id: providerId,
                    type: client_1.TemplateType.EMAIL,
                    isActive: true,
                },
            });
            if (!provider) {
                throw new Error('Email provider not found or inactive');
            }
            const config = provider.config;
            this.config = {
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: {
                    user: config.username,
                    pass: config.password,
                },
                fromEmail: config.fromEmail,
                fromName: config.fromName || 'WeConnect CRM',
            };
            this.createTransporter();
        }
        catch (error) {
            console.error('Error initializing email provider:', error);
            throw error;
        }
    }
    createTransporter() {
        if (!this.config)
            return;
        this.transporter = nodemailer_1.default.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth: this.config.auth,
        });
    }
    async sendEmail(options) {
        if (!this.transporter || !this.config) {
            throw new Error('Email service not configured');
        }
        // Create message record
        const message = await prisma_1.prisma.communicationMessage.create({
            data: {
                leadId: options.leadId,
                userId: options.userId,
                templateId: options.templateId,
                type: client_1.TemplateType.EMAIL,
                recipient: options.to,
                subject: options.subject,
                content: options.content,
                status: client_1.MessageStatus.PENDING,
            },
        });
        try {
            // Send email
            const result = await this.transporter.sendMail({
                from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
                to: options.to,
                subject: options.subject,
                text: options.content,
                html: options.html || options.content,
            });
            // Update message status
            await prisma_1.prisma.communicationMessage.update({
                where: { id: message.id },
                data: {
                    status: client_1.MessageStatus.SENT,
                    sentAt: new Date(),
                    externalId: result.messageId,
                },
            });
            // Create activity log
            await prisma_1.prisma.activity.create({
                data: {
                    title: 'Email sent',
                    description: `Email sent to ${options.to}: ${options.subject}`,
                    type: 'COMMUNICATION_LOGGED',
                    icon: 'FiMail',
                    iconColor: 'text-blue-600',
                    userId: options.userId,
                    metadata: {
                        messageId: message.id,
                        leadId: options.leadId,
                        type: 'email',
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
    async sendTemplatedEmail(templateId, leadId, userId, variables = {}) {
        // Get template
        const template = await prisma_1.prisma.communicationTemplate.findFirst({
            where: {
                id: templateId,
                type: client_1.TemplateType.EMAIL,
                isActive: true,
            },
        });
        if (!template) {
            throw new Error('Email template not found or inactive');
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
        let subject = template.subject || '';
        let content = template.content;
        // Replace variables in subject and content
        Object.entries(templateVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, String(value || ''));
            content = content.replace(regex, String(value || ''));
        });
        // Send email
        return this.sendEmail({
            to: lead.email,
            subject,
            content,
            leadId,
            userId,
            templateId,
        });
    }
    async testConnection() {
        if (!this.transporter) {
            return false;
        }
        try {
            await this.transporter.verify();
            return true;
        }
        catch (error) {
            console.error('Email connection test failed:', error);
            return false;
        }
    }
    async getDeliveryStatus(messageId) {
        const message = await prisma_1.prisma.communicationMessage.findUnique({
            where: { id: messageId },
        });
        return message?.status || client_1.MessageStatus.FAILED;
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=EmailService.js.map