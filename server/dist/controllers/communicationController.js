"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testProvider = exports.deleteProvider = exports.updateProvider = exports.createProvider = exports.getProviders = exports.getAutomationStats = exports.testAutomation = exports.deleteAutomation = exports.updateAutomation = exports.createAutomation = exports.getAutomations = exports.getMessageStatus = exports.getMessages = exports.sendTemplatedMessage = exports.sendWhatsApp = exports.sendEmail = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const EmailService_1 = require("../services/EmailService");
const WhatsAppService_1 = require("../services/WhatsAppService");
const AutomationService_1 = require("../services/AutomationService");
// Templates
const getTemplates = async (req, res) => {
    try {
        const { type, active } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereClause = {
            deletedAt: null,
        };
        if (type) {
            whereClause.type = type;
        }
        if (active !== undefined) {
            whereClause.isActive = active === 'true';
        }
        const [templates, total] = await Promise.all([
            prisma_1.prisma.communicationTemplate.findMany({
                where: whereClause,
                include: {
                    createdByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: offset,
                take: limit,
            }),
            prisma_1.prisma.communicationTemplate.count({
                where: whereClause,
            }),
        ]);
        res.json({
            success: true,
            data: {
                templates,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch templates',
            error: error.message,
        });
    }
};
exports.getTemplates = getTemplates;
const createTemplate = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, type, subject, content, variables, isDefault } = req.body;
        if (!name || !type || !content) {
            return res.status(400).json({
                success: false,
                message: 'Name, type, and content are required',
            });
        }
        // If setting as default, unset other default templates of same type
        if (isDefault) {
            await prisma_1.prisma.communicationTemplate.updateMany({
                where: {
                    type,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });
        }
        const template = await prisma_1.prisma.communicationTemplate.create({
            data: {
                name,
                type,
                subject,
                content,
                variables,
                isDefault: isDefault || false,
                createdBy: userId,
            },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: { template },
        });
    }
    catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message,
        });
    }
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, content, variables, isActive, isDefault } = req.body;
        // If setting as default, unset other default templates of same type
        if (isDefault) {
            const template = await prisma_1.prisma.communicationTemplate.findUnique({
                where: { id: parseInt(id) },
            });
            if (template) {
                await prisma_1.prisma.communicationTemplate.updateMany({
                    where: {
                        type: template.type,
                        isDefault: true,
                        id: { not: parseInt(id) },
                    },
                    data: {
                        isDefault: false,
                    },
                });
            }
        }
        const template = await prisma_1.prisma.communicationTemplate.update({
            where: { id: parseInt(id) },
            data: {
                name,
                subject,
                content,
                variables,
                isActive,
                isDefault,
                updatedAt: new Date(),
            },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            message: 'Template updated successfully',
            data: { template },
        });
    }
    catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template',
            error: error.message,
        });
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.communicationTemplate.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: 'Template deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template',
            error: error.message,
        });
    }
};
exports.deleteTemplate = deleteTemplate;
// Messages
const sendEmail = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { leadId, to, subject, content, html, templateId } = req.body;
        if (!leadId || !to || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Lead ID, recipient, subject, and content are required',
            });
        }
        const messageId = await EmailService_1.emailService.sendEmail({
            to,
            subject,
            content,
            html,
            leadId,
            userId,
            templateId,
        });
        res.json({
            success: true,
            message: 'Email sent successfully',
            data: { messageId },
        });
    }
    catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message,
        });
    }
};
exports.sendEmail = sendEmail;
const sendWhatsApp = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { leadId, to, content, templateId, mediaUrls } = req.body;
        if (!leadId || !to || !content) {
            return res.status(400).json({
                success: false,
                message: 'Lead ID, recipient, and content are required',
            });
        }
        const messageId = await WhatsAppService_1.whatsAppService.sendWhatsApp({
            to,
            content,
            leadId,
            userId,
            templateId,
            mediaUrls,
        });
        res.json({
            success: true,
            message: 'WhatsApp message sent successfully',
            data: { messageId },
        });
    }
    catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send WhatsApp message',
            error: error.message,
        });
    }
};
exports.sendWhatsApp = sendWhatsApp;
const sendTemplatedMessage = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { templateId, leadId, variables } = req.body;
        if (!templateId || !leadId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID and Lead ID are required',
            });
        }
        const template = await prisma_1.prisma.communicationTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found',
            });
        }
        let messageId;
        switch (template.type) {
            case client_1.TemplateType.EMAIL:
                messageId = await EmailService_1.emailService.sendTemplatedEmail(templateId, leadId, userId, variables);
                break;
            case client_1.TemplateType.WHATSAPP:
                messageId = await WhatsAppService_1.whatsAppService.sendTemplatedWhatsApp(templateId, leadId, userId, variables);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Template type ${template.type} not supported`,
                });
        }
        res.json({
            success: true,
            message: 'Templated message sent successfully',
            data: { messageId },
        });
    }
    catch (error) {
        console.error('Error sending templated message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send templated message',
            error: error.message,
        });
    }
};
exports.sendTemplatedMessage = sendTemplatedMessage;
const getMessages = async (req, res) => {
    try {
        const { leadId, type, status } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (leadId) {
            whereClause.leadId = parseInt(leadId);
        }
        if (type) {
            whereClause.type = type;
        }
        if (status) {
            whereClause.status = status;
        }
        const [messages, total] = await Promise.all([
            prisma_1.prisma.communicationMessage.findMany({
                where: whereClause,
                include: {
                    lead: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    template: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: offset,
                take: limit,
            }),
            prisma_1.prisma.communicationMessage.count({
                where: whereClause,
            }),
        ]);
        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message,
        });
    }
};
exports.getMessages = getMessages;
const getMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await prisma_1.prisma.communicationMessage.findUnique({
            where: { id: parseInt(id) },
        });
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }
        // Get updated status from provider
        let status = message.status;
        try {
            if (message.type === client_1.TemplateType.EMAIL) {
                status = await EmailService_1.emailService.getDeliveryStatus(message.id);
            }
            else if (message.type === client_1.TemplateType.WHATSAPP) {
                status = await WhatsAppService_1.whatsAppService.getDeliveryStatus(message.id);
            }
        }
        catch (error) {
            console.error('Error fetching delivery status:', error);
        }
        res.json({
            success: true,
            data: {
                messageId: message.id,
                status,
                sentAt: message.sentAt,
                deliveredAt: message.deliveredAt,
                readAt: message.readAt,
                failedAt: message.failedAt,
                errorMessage: message.errorMessage,
            },
        });
    }
    catch (error) {
        console.error('Error getting message status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get message status',
            error: error.message,
        });
    }
};
exports.getMessageStatus = getMessageStatus;
// Automations
const getAutomations = async (req, res) => {
    try {
        const { triggerType, active } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereClause = {
            deletedAt: null,
        };
        if (triggerType) {
            whereClause.triggerType = triggerType;
        }
        if (active !== undefined) {
            whereClause.isActive = active === 'true';
        }
        const [automations, total] = await Promise.all([
            prisma_1.prisma.communicationAutomation.findMany({
                where: whereClause,
                include: {
                    template: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                    createdByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: offset,
                take: limit,
            }),
            prisma_1.prisma.communicationAutomation.count({
                where: whereClause,
            }),
        ]);
        res.json({
            success: true,
            data: {
                automations,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching automations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch automations',
            error: error.message,
        });
    }
};
exports.getAutomations = getAutomations;
const createAutomation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, triggerType, templateId, conditions, delay } = req.body;
        if (!name || !triggerType || !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Name, trigger type, and template ID are required',
            });
        }
        const automation = await prisma_1.prisma.communicationAutomation.create({
            data: {
                name,
                triggerType,
                templateId,
                conditions,
                delay: delay || 0,
                createdBy: userId,
            },
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: 'Automation created successfully',
            data: { automation },
        });
    }
    catch (error) {
        console.error('Error creating automation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create automation',
            error: error.message,
        });
    }
};
exports.createAutomation = createAutomation;
const updateAutomation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, conditions, delay, isActive } = req.body;
        const automation = await prisma_1.prisma.communicationAutomation.update({
            where: { id: parseInt(id) },
            data: {
                name,
                conditions,
                delay,
                isActive,
                updatedAt: new Date(),
            },
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            message: 'Automation updated successfully',
            data: { automation },
        });
    }
    catch (error) {
        console.error('Error updating automation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update automation',
            error: error.message,
        });
    }
};
exports.updateAutomation = updateAutomation;
const deleteAutomation = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.communicationAutomation.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: 'Automation deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting automation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete automation',
            error: error.message,
        });
    }
};
exports.deleteAutomation = deleteAutomation;
const testAutomation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { leadId } = req.body;
        if (!leadId) {
            return res.status(400).json({
                success: false,
                message: 'Lead ID is required for testing',
            });
        }
        await AutomationService_1.automationService.testAutomation(parseInt(id), leadId, userId);
        res.json({
            success: true,
            message: 'Automation test executed successfully',
        });
    }
    catch (error) {
        console.error('Error testing automation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test automation',
            error: error.message,
        });
    }
};
exports.testAutomation = testAutomation;
const getAutomationStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { dateFrom, dateTo } = req.query;
        const stats = await AutomationService_1.automationService.getAutomationStats(id ? parseInt(id) : undefined, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error fetching automation stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch automation stats',
            error: error.message,
        });
    }
};
exports.getAutomationStats = getAutomationStats;
// Providers
const getProviders = async (req, res) => {
    try {
        const { type } = req.query;
        const whereClause = {};
        if (type) {
            whereClause.type = type;
        }
        const providers = await prisma_1.prisma.communicationProvider.findMany({
            where: whereClause,
            orderBy: {
                type: 'asc',
            },
        });
        res.json({
            success: true,
            data: { providers },
        });
    }
    catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch providers',
            error: error.message,
        });
    }
};
exports.getProviders = getProviders;
const createProvider = async (req, res) => {
    try {
        const { name, type, provider, config, isActive, isDefault } = req.body;
        if (!name || !type || !provider || !config) {
            return res.status(400).json({
                success: false,
                message: 'Name, type, provider, and config are required',
            });
        }
        // If setting as default, unset other default providers of same type
        if (isDefault) {
            await prisma_1.prisma.communicationProvider.updateMany({
                where: {
                    type,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });
        }
        const newProvider = await prisma_1.prisma.communicationProvider.create({
            data: {
                name,
                type,
                config: {
                    provider,
                    ...config
                },
                isActive: isActive !== undefined ? isActive : true,
                isDefault: isDefault || false,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Provider created successfully',
            data: { provider: newProvider },
        });
    }
    catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create provider',
            error: error.message,
        });
    }
};
exports.createProvider = createProvider;
const updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, config, isActive, isDefault } = req.body;
        const existingProvider = await prisma_1.prisma.communicationProvider.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingProvider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }
        // If setting as default, unset other default providers of same type
        if (isDefault) {
            await prisma_1.prisma.communicationProvider.updateMany({
                where: {
                    type: existingProvider.type,
                    isDefault: true,
                    id: { not: parseInt(id) },
                },
                data: {
                    isDefault: false,
                },
            });
        }
        const provider = await prisma_1.prisma.communicationProvider.update({
            where: { id: parseInt(id) },
            data: {
                name,
                config,
                isActive,
                isDefault,
                updatedAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: 'Provider updated successfully',
            data: { provider },
        });
    }
    catch (error) {
        console.error('Error updating provider:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update provider',
            error: error.message,
        });
    }
};
exports.updateProvider = updateProvider;
const deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await prisma_1.prisma.communicationProvider.findUnique({
            where: { id: parseInt(id) },
        });
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }
        // Check if this provider is being used by any templates or automations
        const messageCount = await prisma_1.prisma.communicationMessage.count({
            where: {
                type: provider.type,
                status: 'PENDING'
            },
        });
        if (messageCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete provider that has pending messages',
            });
        }
        await prisma_1.prisma.communicationProvider.delete({
            where: { id: parseInt(id) },
        });
        res.json({
            success: true,
            message: 'Provider deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting provider:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete provider',
            error: error.message,
        });
    }
};
exports.deleteProvider = deleteProvider;
const testProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await prisma_1.prisma.communicationProvider.findUnique({
            where: { id: parseInt(id) },
        });
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }
        let isConnected = false;
        try {
            switch (provider.type) {
                case client_1.TemplateType.EMAIL:
                    await EmailService_1.emailService.initializeFromProvider(provider.id);
                    isConnected = await EmailService_1.emailService.testConnection();
                    break;
                case client_1.TemplateType.WHATSAPP:
                    await WhatsAppService_1.whatsAppService.initializeFromProvider(provider.id);
                    isConnected = await WhatsAppService_1.whatsAppService.testConnection();
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: `Provider type ${provider.type} not supported for testing`,
                    });
            }
        }
        catch (error) {
            console.error('Provider test failed:', error);
        }
        res.json({
            success: true,
            data: {
                providerId: provider.id,
                isConnected,
                message: isConnected ? 'Connection successful' : 'Connection failed',
            },
        });
    }
    catch (error) {
        console.error('Error testing provider:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test provider',
            error: error.message,
        });
    }
};
exports.testProvider = testProvider;
//# sourceMappingURL=communicationController.js.map