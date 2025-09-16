"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadSource = exports.updateLeadSource = exports.createLeadSource = exports.getLeadSources = void 0;
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const getLeadSources = async (req, res) => {
    try {
        const leadSources = await prisma_1.prisma.leadSource.findMany({
            where: { isActive: true },
            orderBy: [{ name: "asc" }],
        });
        res.json({
            success: true,
            data: { leadSources },
        });
    }
    catch (error) {
        console.error("Get lead sources error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLeadSources = getLeadSources;
const createLeadSource = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingLeadSource = await prisma_1.prisma.leadSource.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });
        if (existingLeadSource) {
            return res.status(400).json({
                success: false,
                message: "Lead source with this name already exists",
            });
        }
        const leadSource = await prisma_1.prisma.leadSource.create({
            data: {
                name,
                description,
            },
        });
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.leadSourceChanged("CREATED", { id: leadSource.id, name: leadSource.name }, actorId);
        res.status(201).json({
            success: true,
            message: "Lead source created successfully",
            data: { leadSource },
        });
    }
    catch (error) {
        console.error("Create lead source error:", error);
        // Handle Prisma unique constraint errors
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Lead source with this name already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createLeadSource = createLeadSource;
const updateLeadSource = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;
        const leadSourceId = parseInt(id);
        const existingLeadSource = await prisma_1.prisma.leadSource.findUnique({
            where: { id: leadSourceId },
        });
        if (!existingLeadSource) {
            return res.status(404).json({
                success: false,
                message: "Lead source not found",
            });
        }
        if (name && name.toLowerCase() !== existingLeadSource.name.toLowerCase()) {
            const duplicate = await prisma_1.prisma.leadSource.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: "insensitive",
                    },
                    NOT: { id: leadSourceId },
                },
            });
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Lead source with this name already exists",
                });
            }
        }
        const leadSource = await prisma_1.prisma.leadSource.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                isActive,
            },
        });
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.leadSourceChanged("UPDATED", { id: leadSource.id, name: leadSource.name }, actorId);
        res.json({
            success: true,
            message: "Lead source updated successfully",
            data: { leadSource },
        });
    }
    catch (error) {
        console.error("Update lead source error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateLeadSource = updateLeadSource;
const deleteLeadSource = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.leadSource.delete({
            where: { id: parseInt(id) },
        });
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.leadSourceChanged("DELETED", { id: parseInt(id), name: "" }, actorId);
        res.json({
            success: true,
            message: "Lead source deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete lead source error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteLeadSource = deleteLeadSource;
//# sourceMappingURL=leadSourceController.js.map