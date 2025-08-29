"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndustryField = exports.updateIndustryField = exports.addIndustryField = exports.deleteIndustry = exports.updateIndustry = exports.createIndustry = exports.getIndustries = void 0;
const prisma_1 = require("../lib/prisma");
const getIndustries = async (req, res) => {
    try {
        const industries = await prisma_1.prisma.industry.findMany({
            orderBy: [{ name: "asc" }],
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                fields: {
                    select: {
                        id: true,
                        industryId: true,
                        name: true,
                        type: true,
                        isRequired: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        res.json({ success: true, data: { industries } });
    }
    catch (error) {
        console.error("Get industries error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getIndustries = getIndustries;
const createIndustry = async (req, res) => {
    try {
        const { name, isActive, fields } = req.body;
        const industry = await prisma_1.prisma.industry.create({
            data: {
                name,
                slug: String(name)
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-"),
                isActive: isActive ?? true,
                fields: fields?.length
                    ? {
                        create: fields.map((f) => ({
                            name: f.name,
                            key: String(f.name)
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9\s-]/g, "")
                                .replace(/\s+/g, "_")
                                .replace(/_+/g, "_"),
                            type: normalizeFieldType(f.type) || undefined,
                            isRequired: Boolean(f.isRequired),
                            isActive: f.isActive ?? true,
                        })),
                    }
                    : undefined,
            },
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                fields: {
                    select: {
                        id: true,
                        industryId: true,
                        name: true,
                        type: true,
                        isRequired: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: "Industry created successfully",
            data: { industry },
        });
    }
    catch (error) {
        console.error("Create industry error:", error);
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Industry with this name already exists",
            });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createIndustry = createIndustry;
const updateIndustry = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;
        const industry = await prisma_1.prisma.industry.update({
            where: { id: parseInt(id) },
            data: {
                name,
                slug: name
                    ? String(name)
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-")
                    : undefined,
                isActive,
            },
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                fields: {
                    select: {
                        id: true,
                        industryId: true,
                        name: true,
                        isRequired: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            message: "Industry updated successfully",
            data: { industry },
        });
    }
    catch (error) {
        console.error("Update industry error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateIndustry = updateIndustry;
const deleteIndustry = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.industry.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: "Industry deleted successfully" });
    }
    catch (error) {
        console.error("Delete industry error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteIndustry = deleteIndustry;
const addIndustryField = async (req, res) => {
    try {
        const { id } = req.params; // industry id
        const { name, isRequired, isActive, type } = req.body;
        const field = await prisma_1.prisma.industryField.create({
            data: {
                industryId: parseInt(id),
                name,
                key: String(name)
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "_")
                    .replace(/_+/g, "_"),
                type: normalizeFieldType(type) || undefined,
                isRequired: Boolean(isRequired),
                isActive: isActive ?? true,
            },
        });
        res.status(201).json({ success: true, data: { field } });
    }
    catch (error) {
        console.error("Add industry field error:", error);
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Field with this name already exists for this industry",
            });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.addIndustryField = addIndustryField;
const updateIndustryField = async (req, res) => {
    try {
        const { fieldId } = req.params;
        const { name, isRequired, isActive, type } = req.body;
        const field = await prisma_1.prisma.industryField.update({
            where: { id: parseInt(fieldId) },
            data: {
                name,
                isRequired,
                isActive,
                type: normalizeFieldType(type) || undefined,
            },
        });
        res.json({ success: true, data: { field } });
    }
    catch (error) {
        console.error("Update industry field error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateIndustryField = updateIndustryField;
// Helper to normalize incoming field type strings to Prisma enum values
function normalizeFieldType(input) {
    if (!input)
        return undefined;
    const value = String(input).trim().toUpperCase();
    const map = {
        TEXT: "TEXT",
        NUMBER: "NUMBER",
        DATE: "DATE",
        TIME: "TIME",
        DROPDOWN: "DROPDOWN",
        "MULTI-SELECT": "MULTI_SELECT",
        MULTI_SELECT: "MULTI_SELECT",
        MULTISELECT: "MULTI_SELECT",
        CHECKBOX: "CHECKBOX",
        TOGGLE: "TOGGLE",
        FILE: "FILE",
        FILE_UPLOAD: "FILE",
    };
    return map[value] || undefined;
}
const deleteIndustryField = async (req, res) => {
    try {
        const { fieldId } = req.params;
        await prisma_1.prisma.industryField.delete({ where: { id: parseInt(fieldId) } });
        res.json({ success: true, message: "Field deleted successfully" });
    }
    catch (error) {
        console.error("Delete industry field error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteIndustryField = deleteIndustryField;
//# sourceMappingURL=industryController.js.map