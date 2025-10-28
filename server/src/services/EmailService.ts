import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { TemplateType, MessageStatus } from '@prisma/client';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
  fromName: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  content: string;
  html?: string;
  leadId: number;
  userId: number;
  templateId?: number;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    if (
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_FROM
    ) {
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

  async initializeFromProvider(providerId: number) {
    try {
      const provider = await prisma.communicationProvider.findFirst({
        where: {
          id: providerId,
          type: TemplateType.EMAIL,
          isActive: true,
        },
      });

      if (!provider) {
        throw new Error('Email provider not found or inactive');
      }

      const config = provider.config as any;
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
    } catch (error) {
      console.error('Error initializing email provider:', error);
      throw error;
    }
  }

  private createTransporter() {
    if (!this.config) return;

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<string> {
    if (!this.transporter || !this.config) {
      throw new Error('Email service not configured');
    }

    // Create message record
    const message = await prisma.communicationMessage.create({
      data: {
        leadId: options.leadId,
        userId: options.userId,
        templateId: options.templateId,
        type: TemplateType.EMAIL,
        recipient: options.to,
        subject: options.subject,
        content: options.content,
        status: MessageStatus.PENDING,
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
      await prisma.communicationMessage.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.SENT,
          sentAt: new Date(),
          externalId: result.messageId,
        },
      });

      // Create activity log
      await prisma.activity.create({
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
    } catch (error: any) {
      // Update message with error
      await prisma.communicationMessage.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.FAILED,
          failedAt: new Date(),
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  async sendTemplatedEmail(
    templateId: number,
    leadId: number,
    userId: number,
    variables: Record<string, any> = {}
  ): Promise<string> {
    // Get template
    const template = await prisma.communicationTemplate.findFirst({
      where: {
        id: templateId,
        type: TemplateType.EMAIL,
        isActive: true,
      },
    });

    if (!template) {
      throw new Error('Email template not found or inactive');
    }

    // Get lead data
    const lead = await prisma.lead.findUnique({
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

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  async getDeliveryStatus(messageId: number): Promise<MessageStatus> {
    const message = await prisma.communicationMessage.findUnique({
      where: { id: messageId },
    });

    return message?.status || MessageStatus.FAILED;
  }
}

export const emailService = new EmailService();