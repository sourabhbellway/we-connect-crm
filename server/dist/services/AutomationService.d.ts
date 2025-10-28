import { TriggerType } from '@prisma/client';
interface TriggerContext {
    leadId: number;
    userId: number;
    oldLead?: any;
    newLead?: any;
    variables?: Record<string, any>;
}
export declare class AutomationService {
    handleTrigger(triggerType: TriggerType, context: TriggerContext): Promise<void>;
    private evaluateConditions;
    private scheduleMessage;
    private executeAutomation;
    triggerLeadCreated(leadId: number, userId: number): Promise<void>;
    triggerLeadUpdated(leadId: number, userId: number, oldLead?: any): Promise<void>;
    triggerLeadStatusChanged(leadId: number, userId: number, oldStatus: string, newStatus: string): Promise<void>;
    triggerLeadAssigned(leadId: number, userId: number, oldAssigneeId?: number, newAssigneeId?: number): Promise<void>;
    testAutomation(automationId: number, leadId: number, userId: number): Promise<void>;
    getAutomationStats(automationId?: number, dateFrom?: Date, dateTo?: Date): Promise<any>;
}
export declare const automationService: AutomationService;
export {};
//# sourceMappingURL=AutomationService.d.ts.map