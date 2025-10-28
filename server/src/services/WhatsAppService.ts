import { Twilio } from 'twilio';
import { prisma } from '../lib/prisma';
import { TemplateType, MessageStatus } from '@prisma/client';

interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string; // WhatsApp Business number
}

interface SendWhatsAppOptions {
  to: string;
  content: string;
  leadId: number;
  userId: number;
  templateId?: number;
  mediaUrls?: string[];
}

export class WhatsAppService {
  private client: Twilio | null = null;
  private config: WhatsAppConfig | null = null;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM
    ) {
      this.config = {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_WHATSAPP_FROM,
      };
      this.createClient();
    }
  }

  async initializeFromProvider(providerId: number) {
    try {
      const provider = await prisma.communicationProvider.findFirst({
        where: {
          id: providerId,
          type: TemplateType.WHATSAPP,
          isActive: true,
        },
      });

      if (!provider) {
        throw new Error('WhatsApp provider not found or inactive');
      }

      const config = provider.config as any;
      this.config = {
        accountSid: config.accountSid,
        authToken: config.authToken,
        fromNumber: config.fromNumber,
      };

      this.createClient();
    } catch (error) {
      console.error('Error initializing WhatsApp provider:', error);
      throw error;
    }
  }

  private createClient() {
    if (!this.config) return;

    this.client = new Twilio(this.config.accountSid, this.config.authToken);
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return `whatsapp:+${cleaned}`;
  }

  async sendWhatsApp(options: SendWhatsAppOptions): Promise<string> {
    if (!this.client || !this.config) {
      throw new Error('WhatsApp service not configured');
    }

    const formattedTo = this.formatPhoneNumber(options.to);
    const formattedFrom = this.formatPhoneNumber(this.config.fromNumber);

    // Create message record
    const message = await prisma.communicationMessage.create({
      data: {
        leadId: options.leadId,
        userId: options.userId,
        templateId: options.templateId,
        type: TemplateType.WHATSAPP,
        recipient: options.to,
        content: options.content,
        status: MessageStatus.PENDING,
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
      await prisma.communicationMessage.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.SENT,
          sentAt: new Date(),
          externalId: twilioMessage.sid,
        },
      });

      // Create activity log
      await prisma.activity.create({
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

  async sendTemplatedWhatsApp(
    templateId: number,
    leadId: number,
    userId: number,
    variables: Record<string, any> = {}
  ): Promise<string> {
    // Get template
    const template = await prisma.communicationTemplate.findFirst({
      where: {
        id: templateId,
        type: TemplateType.WHATSAPP,
        isActive: true,
      },
    });

    if (!template) {
      throw new Error('WhatsApp template not found or inactive');
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

  async sendWhatsAppWithMedia(
    options: SendWhatsAppOptions & { mediaUrls: string[] }
  ): Promise<string> {
    return this.sendWhatsApp(options);
  }

  async getDeliveryStatus(messageId: number): Promise<MessageStatus> {
    const message = await prisma.communicationMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || !message.externalId || !this.client) {
      return message?.status || MessageStatus.FAILED;
    }

    try {
      // Get message status from Twilio
      const twilioMessage = await this.client.messages(message.externalId).fetch();
      
      let status: MessageStatus;
      switch (twilioMessage.status) {
        case 'queued':
        case 'accepted':
          status = MessageStatus.PENDING;
          break;
        case 'sent':
          status = MessageStatus.SENT;
          break;
        case 'delivered':
          status = MessageStatus.DELIVERED;
          break;
        case 'read':
          status = MessageStatus.READ;
          break;
        case 'failed':
        case 'undelivered':
          status = MessageStatus.FAILED;
          break;
        default:
          status = MessageStatus.SENT;
      }

      // Update message status if changed
      if (status !== message.status) {
        await prisma.communicationMessage.update({
          where: { id: messageId },
          data: {
            status,
            deliveredAt: status === MessageStatus.DELIVERED ? new Date() : undefined,
            readAt: status === MessageStatus.READ ? new Date() : undefined,
          },
        });
      }

      return status;
    } catch (error) {
      console.error('Error fetching WhatsApp message status:', error);
      return message.status;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client || !this.config) {
      return false;
    }

    try {
      // Test connection by fetching account info
      await this.client.api.accounts(this.config.accountSid).fetch();
      return true;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }

  // WhatsApp Business API template methods (for approved templates)
  async sendApprovedTemplate(
    templateName: string,
    to: string,
    parameters: string[],
    leadId: number,
    userId: number
  ): Promise<string> {
    if (!this.client || !this.config) {
      throw new Error('WhatsApp service not configured');
    }

    const formattedTo = this.formatPhoneNumber(to);
    const formattedFrom = this.formatPhoneNumber(this.config.fromNumber);

    // Create message record
    const message = await prisma.communicationMessage.create({
      data: {
        leadId,
        userId,
        type: TemplateType.WHATSAPP,
        recipient: to,
        content: `Template: ${templateName}`,
        status: MessageStatus.PENDING,
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
      await prisma.communicationMessage.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.SENT,
          sentAt: new Date(),
          externalId: twilioMessage.sid,
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
}

export const whatsAppService = new WhatsAppService();