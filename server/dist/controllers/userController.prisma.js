"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = exports.getUsers = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const getUsers = async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isActive: true,
                                permissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                name: true,
                                                key: true,
                                                description: true,
                                                module: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        });
        // Transform the data to match the expected format
        const transformedUsers = users.map((user) => ({
            ...user,
            roles: user.roles.map((ur) => ({
                ...ur.role,
                permissions: ur.role.permissions.map((rp) => rp.permission),
            })),
        }));
        res.json({
            success: true,
            data: { users: transformedUsers },
        });
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { email, password, firstName, lastName, roleIds } = req.body;
        // Hash password (you'll need to implement this)
        const hashedPassword = await hashPassword(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                roles: roleIds && roleIds.length > 0
                    ? {
                        create: roleIds.map((roleId) => ({
                            role: {
                                connect: { id: roleId },
                            },
                        })),
                    }
                    : undefined,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isActive: true,
                                permissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                name: true,
                                                key: true,
                                                description: true,
                                                module: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        // Transform the data to match the expected format
        const transformedUser = {
            ...user,
            roles: user.roles.map((ur) => ({
                ...ur.role,
                permissions: ur.role.permissions.map((rp) => rp.permission),
            })),
        };
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: { user: transformedUser },
        });
    }
    catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createUser = createUser;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isActive: true,
                                permissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                name: true,
                                                key: true,
                                                description: true,
                                                module: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Transform the data to match the expected format
        const transformedUser = {
            ...user,
            roles: user.roles.map((ur) => ({
                ...ur.role,
                permissions: ur.role.permissions.map((rp) => rp.permission),
            })),
        };
        res.json({
            success: true,
            data: { user: transformedUser },
        });
    }
    catch (error) {
        console.error("Get user by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
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
        const { email, firstName, lastName, isActive, roleIds } = req.body;
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Update user
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                email,
                firstName,
                lastName,
                isActive,
                roles: {
                    deleteMany: {},
                    create: roleIds && roleIds.length > 0
                        ? roleIds.map((roleId) => ({
                            role: {
                                connect: { id: roleId },
                            },
                        }))
                        : [],
                },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isActive: true,
                                permissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                name: true,
                                                key: true,
                                                description: true,
                                                module: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        // Transform the data to match the expected format
        const transformedUser = {
            ...updatedUser,
            roles: updatedUser.roles.map((ur) => ({
                ...ur.role,
                permissions: ur.role.permissions.map((rp) => rp.permission),
            })),
        };
        res.json({
            success: true,
            message: "User updated successfully",
            data: { user: transformedUser },
        });
    }
    catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Delete user (this will cascade delete related records)
        await prisma_1.prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteUser = deleteUser;
// Helper function for password hashing
async function hashPassword(password) {
    const bcrypt = require("bcryptjs");
    return bcrypt.hash(password, 12);
}
//# sourceMappingURL=userController.prisma.js.map