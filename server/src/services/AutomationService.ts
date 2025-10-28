import { prisma } from '../lib/prisma';
import { TriggerType, TemplateType } from '@prisma/client';
import { emailService } from './EmailService';
import { whatsAppService } from './WhatsAppService';

interface TriggerContext {
  leadId: number;
  userId: number;
  oldLead?: any;
  newLead?: any;
  variables?: Record<string, any>;
}

export class AutomationService {
  async handleTrigger(triggerType: TriggerType, context: TriggerContext): Promise<void> {
    try {
      // Find active automations for this trigger type
      const automations = await prisma.communicationAutomation.findMany({
        where: {
          triggerType,
          isActive: true,
        },
        include: {
          template: true,
        },
      });

      if (automations.length === 0) {
        return;
      }

      // Process each automation
      for (const automation of automations) {
        try {
          // Check if conditions are met
          if (automation.conditions && !this.evaluateConditions(automation.conditions as any, context)) {
            continue;
          }

          // Schedule or send immediately
          if (automation.delay && automation.delay > 0) {
            await this.scheduleMessage(automation, context);
          } else {
            await this.executeAutomation(automation, context);
          }
        } catch (error) {
          console.error(`Error processing automation ${automation.id}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error handling trigger ${triggerType}:`, error);
    }
  }

  private evaluateConditions(conditions: any, context: TriggerContext): boolean {
    // Simple condition evaluation logic
    // Can be extended for more complex conditions
    if (!conditions || typeof conditions !== 'object') {
      return true;
    }

    // Example condition structure:
    // {
    //   "leadStatus": "new",
    //   "leadSource": "website",
    //   "hasPhone": true
    // }

    const lead = context.newLead || context.oldLead;
    if (!lead) return false;

    for (const [key, expectedValue] of Object.entries(conditions)) {
      switch (key) {
        case 'leadStatus':
          if (lead.status !== expectedValue) return false;
          break;
        case 'leadSource':
          if (lead.source?.name !== expectedValue) return false;
          break;
        case 'hasEmail':
          if (!lead.email && expectedValue) return false;
          break;
        case 'hasPhone':
          if (!lead.phone && expectedValue) return false;
          break;
        case 'leadPriority':
          if (lead.priority !== expectedValue) return false;
          break;
        case 'assignedTo':
          if (lead.assignedTo !== expectedValue) return false;
          break;
        default:
          // Custom field evaluation
          if (lead[key] !== expectedValue) return false;
      }
    }

    return true;
  }

  private async scheduleMessage(automation: any, context: TriggerContext): Promise<void> {
    // For now, we'll use a simple timeout approach
    // In production, you might want to use a job queue like Bull or Agenda
    const delayMs = automation.delay * 60 * 1000; // Convert minutes to milliseconds

    setTimeout(async () => {
      try {
        await this.executeAutomation(automation, context);
      } catch (error) {
        console.error(`Error executing delayed automation ${automation.id}:`, error);
      }
    }, delayMs);

    console.log(`Scheduled automation ${automation.id} to execute in ${automation.delay} minutes`);
  }

  private async executeAutomation(automation: any, context: TriggerContext): Promise<void> {
    const template = automation.template;
    if (!template || !template.isActive) {
      console.warn(`Template ${automation.templateId} not found or inactive`);
      return;
    }

    try {
      switch (template.type) {
        case TemplateType.EMAIL:
          await emailService.sendTemplatedEmail(
            template.id,
            context.leadId,
            context.userId,
            context.variables
          );
          break;

        case TemplateType.WHATSAPP:
          await whatsAppService.sendTemplatedWhatsApp(
            template.id,
            context.leadId,
            context.userId,
            context.variables
          );
          break;

        case TemplateType.SMS:
          // TODO: Implement SMS service
          console.warn('SMS automation not yet implemented');
          break;

        default:
          console.warn(`Unknown template type: ${template.type}`);
      }

      // Log successful automation execution
      await prisma.activity.create({
        data: {
          title: 'Automation executed',
          description: `Automation "${automation.name}" executed for trigger ${automation.triggerType}`,
          type: 'COMMUNICATION_LOGGED',
          icon: 'FiZap',
          iconColor: 'text-purple-600',
          userId: context.userId,
          metadata: {
            automationId: automation.id,
            templateId: template.id,
            triggerType: automation.triggerType,
            leadId: context.leadId,
          },
        },
      });
    } catch (error) {
      console.error(`Error executing automation ${automation.id}:`, error);
    }
  }

  // Trigger methods for different events
  async triggerLeadCreated(leadId: number, userId: number): Promise<void> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        source: true,
        assignedUser: true,
        companies: true,
      },
    });

    if (!lead) return;

    await this.handleTrigger(TriggerType.LEAD_CREATED, {
      leadId,
      userId,
      newLead: lead,
      variables: {
        triggerEvent: 'Lead Created',
        leadCreatedAt: lead.createdAt.toISOString(),
      },
    });
  }

  async triggerLeadUpdated(leadId: number, userId: number, oldLead?: any): Promise<void> {
    const newLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        source: true,
        assignedUser: true,
        companies: true,
      },
    });

    if (!newLead) return;

    await this.handleTrigger(TriggerType.LEAD_UPDATED, {
      leadId,
      userId,
      oldLead,
      newLead,
      variables: {
        triggerEvent: 'Lead Updated',
        leadUpdatedAt: newLead.updatedAt.toISOString(),
      },
    });
  }

  async triggerLeadStatusChanged(
    leadId: number,
    userId: number,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        source: true,
        assignedUser: true,
        companies: true,
      },
    });

    if (!lead) return;

    await this.handleTrigger(TriggerType.LEAD_STATUS_CHANGED, {
      leadId,
      userId,
      newLead: lead,
      variables: {
        triggerEvent: 'Lead Status Changed',
        oldStatus,
        newStatus,
        statusChangedAt: new Date().toISOString(),
      },
    });
  }

  async triggerLeadAssigned(
    leadId: number,
    userId: number,
    oldAssigneeId?: number,
    newAssigneeId?: number
  ): Promise<void> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        source: true,
        assignedUser: true,
        companies: true,
      },
    });

    if (!lead) return;

    const oldAssignee = oldAssigneeId
      ? await prisma.user.findUnique({ where: { id: oldAssigneeId } })
      : null;

    const newAssignee = newAssigneeId
      ? await prisma.user.findUnique({ where: { id: newAssigneeId } })
      : null;

    await this.handleTrigger(TriggerType.LEAD_ASSIGNED, {
      leadId,
      userId,
      newLead: lead,
      variables: {
        triggerEvent: 'Lead Assigned',
        oldAssigneeName: oldAssignee ? `${oldAssignee.firstName} ${oldAssignee.lastName}` : 'Unassigned',
        newAssigneeName: newAssignee ? `${newAssignee.firstName} ${newAssignee.lastName}` : 'Unassigned',
        assignedAt: new Date().toISOString(),
      },
    });
  }

  // Manual trigger for testing automations
  async testAutomation(automationId: number, leadId: number, userId: number): Promise<void> {
    const automation = await prisma.communicationAutomation.findUnique({
      where: { id: automationId },
      include: { template: true },
    });

    if (!automation) {
      throw new Error('Automation not found');
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        source: true,
        assignedUser: true,
        companies: true,
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    await this.executeAutomation(automation, {
      leadId,
      userId,
      newLead: lead,
      variables: {
        triggerEvent: 'Manual Test',
        testExecutedAt: new Date().toISOString(),
      },
    });
  }

  // Get automation statistics
  async getAutomationStats(automationId?: number, dateFrom?: Date, dateTo?: Date): Promise<any> {
    const whereClause: any = {};

    if (automationId) {
      whereClause['metadata.automationId'] = automationId;
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) whereClause.createdAt.lte = dateTo;
    }

    // Get automation execution activities
    const activities = await prisma.activity.findMany({
      where: {
        type: 'COMMUNICATION_LOGGED',
        title: 'Automation executed',
        ...whereClause,
      },
      select: {
        metadata: true,
        createdAt: true,
      },
    });

    // Get message delivery stats
    const messages = await prisma.communicationMessage.groupBy({
      by: ['status', 'type'],
      where: {
        templateId: { not: null },
        createdAt: {
          gte: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
          lte: dateTo || new Date(),
        },
      },
      _count: {
        id: true,
      },
    });

    return {
      totalExecutions: activities.length,
      messageStats: messages.reduce((acc, msg) => {
        const key = `${msg.type.toLowerCase()}_${msg.status.toLowerCase()}`;
        acc[key] = msg._count.id;
        return acc;
      }, {} as Record<string, number>),
      recentExecutions: activities.slice(0, 10),
    };
  }
}

export const automationService = new AutomationService();