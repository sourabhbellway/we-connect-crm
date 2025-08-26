"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoles = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const getRoles = async (req, res) => {
    try {
        const roles = await prisma_1.prisma.role.findMany({
            where: { isActive: true },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
        // Transform the data to match expected format
        const transformedRoles = roles.map((role) => ({
            ...role,
            permissions: role.permissions.map((rp) => rp.permission),
        }));
        res.json({
            success: true,
            data: { roles: transformedRoles },
        });
    }
    catch (error) {
        console.error("Get roles error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getRoles = getRoles;
const createRole = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { name, description, permissionIds } = req.body;
        const role = await prisma_1.prisma.role.create({
            data: {
                name,
                description,
                permissions: permissionIds && permissionIds.length > 0
                    ? {
                        create: permissionIds.map((permissionId) => ({
                            permission: {
                                connect: { id: permissionId },
                            },
                        })),
                    }
                    : undefined,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        // Transform the data
        const transformedRole = {
            ...role,
            permissions: role.permissions.map((rp) => rp.permission),
        };
        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: { role: transformedRole },
        });
    }
    catch (error) {
        console.error("Create role error:", error);
        // Handle Prisma unique constraint errors
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Role with this name already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createRole = createRole;
const updateRole = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { id } = req.params;
        const { name, description, isActive, permissionIds } = req.body;
        // Check if role exists
        const existingRole = await prisma_1.prisma.role.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }
        const role = await prisma_1.prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                isActive,
                permissions: {
                    deleteMany: {},
                    create: permissionIds && permissionIds.length > 0
                        ? permissionIds.map((permissionId) => ({
                            permission: {
                                connect: { id: permissionId },
                            },
                        }))
                        : [],
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        // Transform the data
        const transformedRole = {
            ...role,
            permissions: role.permissions.map((rp) => rp.permission),
        };
        res.json({
            success: true,
            message: "Role updated successfully",
            data: { role: transformedRole },
        });
    }
    catch (error) {
        console.error("Update role error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if role exists
        const existingRole = await prisma_1.prisma.role.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }
        await prisma_1.prisma.role.delete({
            where: { id: parseInt(id) },
        });
        res.json({
            success: true,
            message: "Role deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete role error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=roleController.js.map