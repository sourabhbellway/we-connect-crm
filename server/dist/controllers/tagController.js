"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.createTag = exports.getTags = void 0;
const prisma_1 = require("../lib/prisma");
const getTags = async (req, res) => {
    try {
        const tags = await prisma_1.prisma.tag.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });
        res.json({
            success: true,
            data: { tags },
        });
    }
    catch (error) {
        console.error("Get tags error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getTags = getTags;
const createTag = async (req, res) => {
    try {
        const { name, color, description } = req.body;
        const tag = await prisma_1.prisma.tag.create({
            data: {
                name,
                color,
                description,
            },
        });
        res.status(201).json({
            success: true,
            message: "Tag created successfully",
            data: { tag },
        });
    }
    catch (error) {
        console.error("Create tag error:", error);
        // Handle Prisma unique constraint errors
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Tag with this name already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createTag = createTag;
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, description, isActive } = req.body;
        const tag = await prisma_1.prisma.tag.update({
            where: { id: parseInt(id) },
            data: {
                name,
                color,
                description,
                isActive,
            },
        });
        res.json({
            success: true,
            message: "Tag updated successfully",
            data: { tag },
        });
    }
    catch (error) {
        console.error("Update tag error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.tag.delete({
            where: { id: parseInt(id) },
        });
        res.json({
            success: true,
            message: "Tag deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete tag error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteTag = deleteTag;
//# sourceMappingURL=tagController.js.map