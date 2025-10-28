"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalTemplateController = exports.ProposalTemplateController = void 0;
const prisma_1 = require("../lib/prisma");
class ProposalTemplateController {
    // Get all proposal templates
    async getAll(req, res) {
        try {
            const { category, isActive } = req.query;
            const where = {
                deletedAt: null,
            };
            if (category) {
                where.category = category;
            }
            if (isActive !== undefined) {
                where.isActive = isActive === "true";
            }
            const templates = await prisma_1.prisma.proposalTemplate.findMany({
                where,
                orderBy: [
                    { isDefault: "desc" },
                    { createdAt: "desc" }
                ],
            });
            res.json({
                success: true,
                data: templates,
            });
        }
        catch (error) {
            console.error("Error fetching proposal templates:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch proposal templates",
            });
        }
    }
    // Get single template by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const template = await prisma_1.prisma.proposalTemplate.findFirst({
                where: {
                    id: Number(id),
                    deletedAt: null,
                },
            });
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template not found",
                });
            }
            res.json({
                success: true,
                data: template,
            });
        }
        catch (error) {
            console.error("Error fetching proposal template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch proposal template",
            });
        }
    }
    // Create new template
    async create(req, res) {
        try {
            const { name, description, content, headerHtml, footerHtml, styles, variables, previewImage, category, isActive, isDefault, } = req.body;
            // If this is set as default, unset other defaults
            if (isDefault) {
                await prisma_1.prisma.proposalTemplate.updateMany({
                    where: { isDefault: true },
                    data: { isDefault: false },
                });
            }
            const template = await prisma_1.prisma.proposalTemplate.create({
                data: {
                    name,
                    description,
                    content,
                    headerHtml,
                    footerHtml,
                    styles: styles || {},
                    variables: variables || {},
                    previewImage,
                    category: category || "business",
                    isActive: isActive !== undefined ? isActive : true,
                    isDefault: isDefault || false,
                },
            });
            res.status(201).json({
                success: true,
                data: template,
                message: "Proposal template created successfully",
            });
        }
        catch (error) {
            console.error("Error creating proposal template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create proposal template",
            });
        }
    }
    // Update template
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description, content, headerHtml, footerHtml, styles, variables, previewImage, category, isActive, isDefault, } = req.body;
            // Check if template exists
            const existingTemplate = await prisma_1.prisma.proposalTemplate.findFirst({
                where: {
                    id: Number(id),
                    deletedAt: null,
                },
            });
            if (!existingTemplate) {
                return res.status(404).json({
                    success: false,
                    message: "Template not found",
                });
            }
            // If this is set as default, unset other defaults
            if (isDefault && !existingTemplate.isDefault) {
                await prisma_1.prisma.proposalTemplate.updateMany({
                    where: { isDefault: true },
                    data: { isDefault: false },
                });
            }
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (content !== undefined)
                updateData.content = content;
            if (headerHtml !== undefined)
                updateData.headerHtml = headerHtml;
            if (footerHtml !== undefined)
                updateData.footerHtml = footerHtml;
            if (styles !== undefined)
                updateData.styles = styles;
            if (variables !== undefined)
                updateData.variables = variables;
            if (previewImage !== undefined)
                updateData.previewImage = previewImage;
            if (category !== undefined)
                updateData.category = category;
            if (isActive !== undefined)
                updateData.isActive = isActive;
            if (isDefault !== undefined)
                updateData.isDefault = isDefault;
            const template = await prisma_1.prisma.proposalTemplate.update({
                where: { id: Number(id) },
                data: updateData,
            });
            res.json({
                success: true,
                data: template,
                message: "Proposal template updated successfully",
            });
        }
        catch (error) {
            console.error("Error updating proposal template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update proposal template",
            });
        }
    }
    // Delete template (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const template = await prisma_1.prisma.proposalTemplate.findFirst({
                where: {
                    id: Number(id),
                    deletedAt: null,
                },
            });
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template not found",
                });
            }
            await prisma_1.prisma.proposalTemplate.update({
                where: { id: Number(id) },
                data: { deletedAt: new Date() },
            });
            res.json({
                success: true,
                message: "Proposal template deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting proposal template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete proposal template",
            });
        }
    }
    // Set default template
    async setDefault(req, res) {
        try {
            const { id } = req.params;
            const template = await prisma_1.prisma.proposalTemplate.findFirst({
                where: {
                    id: Number(id),
                    deletedAt: null,
                },
            });
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template not found",
                });
            }
            // Unset all other defaults
            await prisma_1.prisma.proposalTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
            // Set this as default
            const updatedTemplate = await prisma_1.prisma.proposalTemplate.update({
                where: { id: Number(id) },
                data: { isDefault: true },
            });
            res.json({
                success: true,
                data: updatedTemplate,
                message: "Default template updated successfully",
            });
        }
        catch (error) {
            console.error("Error setting default template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to set default template",
            });
        }
    }
    // Duplicate template
    async duplicate(req, res) {
        try {
            const { id } = req.params;
            const template = await prisma_1.prisma.proposalTemplate.findFirst({
                where: {
                    id: Number(id),
                    deletedAt: null,
                },
            });
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template not found",
                });
            }
            const newTemplate = await prisma_1.prisma.proposalTemplate.create({
                data: {
                    name: `${template.name} (Copy)`,
                    description: template.description,
                    content: template.content,
                    headerHtml: template.headerHtml,
                    footerHtml: template.footerHtml,
                    styles: template.styles ?? undefined,
                    variables: template.variables ?? undefined,
                    previewImage: template.previewImage,
                    category: template.category,
                    isActive: template.isActive,
                    isDefault: false, // Never duplicate as default
                },
            });
            res.status(201).json({
                success: true,
                data: newTemplate,
                message: "Template duplicated successfully",
            });
        }
        catch (error) {
            console.error("Error duplicating template:", error);
            res.status(500).json({
                success: false,
                message: "Failed to duplicate template",
            });
        }
    }
}
exports.ProposalTemplateController = ProposalTemplateController;
exports.proposalTemplateController = new ProposalTemplateController();
//# sourceMappingURL=proposalTemplateController.js.map