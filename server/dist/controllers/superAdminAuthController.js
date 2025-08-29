"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuperAdminProfile = exports.superAdminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const activityLogger_1 = require("../utils/activityLogger");
const superAdminLogin = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { email, password } = req.body;
        // Check Super Admin table instead of regular users table
        const superAdmin = await prisma_1.prisma.superAdmin.findFirst({
            where: { email, isActive: true },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                lastLogin: true,
                roleAssignments: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                rolePermissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                name: true,
                                                key: true,
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
        if (!superAdmin || !(await bcryptjs_1.default.compare(password, superAdmin.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid Super Admin credentials",
            });
        }
        // Update last login
        await prisma_1.prisma.superAdmin.update({
            where: { id: superAdmin.id },
            data: { lastLogin: new Date() },
        });
        // Log Super Admin login activity
        await activityLogger_1.activityLoggers.userLogin({
            id: superAdmin.id,
            firstName: superAdmin.firstName,
            lastName: superAdmin.lastName,
            email: superAdmin.email,
        });
        // Transform roles data
        const transformedRoles = superAdmin.roleAssignments.map((ra) => ({
            id: ra.role.id,
            name: ra.role.name,
            permissions: ra.role.rolePermissions.map((rp) => rp.permission),
        }));
        // Generate JWT token with Super Admin flag
        const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
        const expiresIn = process.env.JWT_EXPIRE || "24h";
        const token = jsonwebtoken_1.default.sign({
            superAdminId: superAdmin.id,
            email: superAdmin.email,
            isSuperAdmin: true,
            roles: transformedRoles.map((role) => ({
                id: role.id,
                name: role.name,
                permissions: role.permissions.map((perm) => perm.key),
            })),
        }, secret, { expiresIn });
        // Calculate expiry timestamp
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 24); // 24 hours from now
        res.json({
            success: true,
            message: "Super Admin login successful",
            data: {
                token,
                tokenExpiry: expiryTime.toISOString(),
                user: {
                    id: superAdmin.id,
                    email: superAdmin.email,
                    firstName: superAdmin.firstName,
                    lastName: superAdmin.lastName,
                    fullName: `${superAdmin.firstName} ${superAdmin.lastName}`,
                    lastLogin: superAdmin.lastLogin,
                    isSuperAdmin: true,
                    roles: transformedRoles,
                },
            },
        });
    }
    catch (error) {
        console.error("Super Admin login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.superAdminLogin = superAdminLogin;
const getSuperAdminProfile = async (req, res) => {
    try {
        const superAdminId = req.user?.superAdminId;
        if (!superAdminId) {
            return res.status(401).json({
                success: false,
                message: "Super Admin authentication required",
            });
        }
        const superAdmin = await prisma_1.prisma.superAdmin.findUnique({
            where: { id: superAdminId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                profilePicture: true,
                roleAssignments: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                rolePermissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                name: true,
                                                key: true,
                                                module: true,
                                                description: true,
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
        if (!superAdmin) {
            return res.status(404).json({
                success: false,
                message: "Super Admin not found",
            });
        }
        // Transform roles data
        const transformedRoles = superAdmin.roleAssignments.map((ra) => ({
            id: ra.role.id,
            name: ra.role.name,
            description: ra.role.description,
            permissions: ra.role.rolePermissions.map((rp) => rp.permission),
        }));
        res.json({
            success: true,
            message: "Super Admin profile retrieved successfully",
            data: {
                user: {
                    id: superAdmin.id,
                    email: superAdmin.email,
                    firstName: superAdmin.firstName,
                    lastName: superAdmin.lastName,
                    fullName: `${superAdmin.firstName} ${superAdmin.lastName}`,
                    isActive: superAdmin.isActive,
                    lastLogin: superAdmin.lastLogin,
                    createdAt: superAdmin.createdAt,
                    updatedAt: superAdmin.updatedAt,
                    profilePicture: superAdmin.profilePicture,
                    isSuperAdmin: true,
                    roles: transformedRoles,
                },
            },
        });
    }
    catch (error) {
        console.error("Get Super Admin profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getSuperAdminProfile = getSuperAdminProfile;
//# sourceMappingURL=superAdminAuthController.js.map