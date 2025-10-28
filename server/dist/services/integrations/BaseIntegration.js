"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIntegration = void 0;
class BaseIntegration {
    constructor(prisma, config, integrationId) {
        this.prisma = prisma;
        this.config = config;
        this.integrationId = integrationId;
    }
    async logOperation(operation, status, message, data, errorDetails, recordsCount) {
        await this.prisma.integrationLog.create({
            data: {
                integrationId: this.integrationId,
                operation,
                status,
                message,
                data,
                errorDetails,
                recordsCount: recordsCount || 0,
            },
        });
    }
    async syncLead(leadData) {
        try {
            // Check if lead already exists by external ID
            const existingSync = await this.prisma.leadIntegrationSync.findUnique({
                where: {
                    externalId_integrationId: {
                        externalId: leadData.externalId,
                        integrationId: this.integrationId,
                    },
                },
                include: { lead: true },
            });
            let leadId;
            if (existingSync) {
                // Update existing lead
                const updatedLead = await this.prisma.lead.update({
                    where: { id: existingSync.leadId },
                    data: {
                        firstName: leadData.firstName,
                        lastName: leadData.lastName,
                        email: leadData.email,
                        phone: leadData.phone,
                        company: leadData.company,
                        position: leadData.position,
                        notes: leadData.notes,
                        budget: leadData.budget,
                        industry: leadData.industry,
                        website: leadData.website,
                        address: leadData.address,
                        country: leadData.country,
                        state: leadData.state,
                        city: leadData.city,
                        zipCode: leadData.zipCode,
                        updatedAt: new Date(),
                    },
                });
                // Update sync record
                await this.prisma.leadIntegrationSync.update({
                    where: { id: existingSync.id },
                    data: {
                        externalData: leadData,
                        syncStatus: 'SYNCED',
                        lastSyncAt: new Date(),
                        errorMessage: undefined,
                    },
                });
                leadId = updatedLead.id;
            }
            else {
                // Create new lead
                const newLead = await this.prisma.lead.create({
                    data: {
                        firstName: leadData.firstName,
                        lastName: leadData.lastName,
                        email: leadData.email,
                        phone: leadData.phone,
                        company: leadData.company,
                        position: leadData.position,
                        notes: leadData.notes,
                        budget: leadData.budget,
                        industry: leadData.industry,
                        website: leadData.website,
                        address: leadData.address,
                        country: leadData.country,
                        state: leadData.state,
                        city: leadData.city,
                        zipCode: leadData.zipCode,
                        status: 'NEW',
                        priority: 'MEDIUM',
                    },
                });
                // Create sync record
                await this.prisma.leadIntegrationSync.create({
                    data: {
                        leadId: newLead.id,
                        integrationId: this.integrationId,
                        externalId: leadData.externalId,
                        externalData: leadData,
                        syncStatus: 'SYNCED',
                        lastSyncAt: new Date(),
                    },
                });
                leadId = newLead.id;
            }
            return { success: true, leadId };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            // Try to create/update sync record with error status
            try {
                const existingSync = await this.prisma.leadIntegrationSync.findUnique({
                    where: {
                        externalId_integrationId: {
                            externalId: leadData.externalId,
                            integrationId: this.integrationId,
                        },
                    },
                });
                if (existingSync) {
                    await this.prisma.leadIntegrationSync.update({
                        where: { id: existingSync.id },
                        data: {
                            syncStatus: 'FAILED',
                            errorMessage,
                            lastSyncAt: new Date(),
                        },
                    });
                }
            }
            catch (syncError) {
                console.error('Error updating sync record:', syncError);
            }
            return { success: false, error: errorMessage };
        }
    }
    sanitizeLeadData(data) {
        return {
            firstName: data.firstName || data.first_name || '',
            lastName: data.lastName || data.last_name || '',
            email: data.email || '',
            phone: data.phone || data.mobile || data.phoneNumber || undefined,
            company: data.company || data.companyName || undefined,
            position: data.position || data.jobTitle || undefined,
            notes: data.notes || data.description || undefined,
            source: this.getName(),
            externalId: data.id || data.externalId || data.leadId || '',
            budget: data.budget ? parseFloat(data.budget) : undefined,
            industry: data.industry || undefined,
            website: data.website || undefined,
            address: data.address || undefined,
            country: data.country || undefined,
            state: data.state || undefined,
            city: data.city || undefined,
            zipCode: data.zipCode || data.postalCode || undefined,
        };
    }
}
exports.BaseIntegration = BaseIntegration;
//# sourceMappingURL=BaseIntegration.js.map