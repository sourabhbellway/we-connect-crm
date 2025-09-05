"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = exports.getUsers = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const getUsers = async (req, res) => {
    try {
        const { search, status, roleId, page = 1, limit = 50 } = req.query;
        //console.log("Query parameters:", { search, status, roleId, page, limit });
        // Build where clause for filtering
        const where = {};
        // Search filter (search in firstName, lastName, and email)
        if (search && typeof search === "string") {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        // Status filter
        if (status && typeof status === "string") {
            if (status === "active") {
                where.isActive = true;
            }
            else if (status === "inactive") {
                where.isActive = false;
            }
        }
        // Role filter
        if (roleId && typeof roleId === "string") {
            const roleIdNum = parseInt(roleId);
            if (!isNaN(roleIdNum)) {
                where.roles = {
                    some: {
                        roleId: roleIdNum,
                    },
                };
            }
        }
        //console.log("Where clause:", JSON.stringify(where, null, 2));
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid page number",
            });
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Invalid limit number. Must be between 1 and 100",
            });
        }
        const skip = (pageNum - 1) * limitNum;
        // Get users with filters
        const users = await prisma_1.prisma.user.findMany({
            where,
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
            skip,
            take: limitNum,
        });
        // Get total count for pagination
        const totalUsers = await prisma_1.prisma.user.count({ where });
        const totalPages = Math.ceil(totalUsers / limitNum);
        //console.log(`Found ${users.length} users out of ${totalUsers} total`);
        // Transform the data to match the expected format
        const transformedUsers = users.map((user) => ({
            ...user,
            fullName: `${user.firstName} ${user.lastName}`,
            roles: user.roles.map((ur) => ({
                ...ur.role,
                permissions: ur.role.permissions.map((rp) => rp.permission),
            })),
        }));
        res.json({
            success: true,
            data: {
                users: transformedUsers,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalUsers,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1,
                },
            },
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
        // Hash password
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 12);
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }
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
        // Log activity for admin-created user
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.userCreated({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }, actorId);
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
        // Handle Prisma unique constraint errors
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }
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
const getUserStats = async (req, res) => {
    try {
        // Calculate date for 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Get user statistics
        const totalUsers = await prisma_1.prisma.user.count();
        const activeUsers = await prisma_1.prisma.user.count({ where: { isActive: true } });
        const inactiveUsers = await prisma_1.prisma.user.count({
            where: { isActive: false },
        });
        const newUsers = await prisma_1.prisma.user.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });
        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers,
                    newUsers,
                },
            },
        });
    }
    catch (error) {
        console.error("Get user stats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=userController.js.map