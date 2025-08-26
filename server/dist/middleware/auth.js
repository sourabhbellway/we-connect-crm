"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requirePermission = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token required",
            });
        }
        const jwtSecret = process.env.JWT_SECRET || "default-secret-change-in-production";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Check if token is expired
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({
                success: false,
                message: "Token expired",
                code: "TOKEN_EXPIRED",
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                permissions: {
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
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive",
            });
        }
        // Transform roles data to match expected format
        const transformedUser = {
            ...user,
            roles: user.roles.map((ur) => ({
                id: ur.role.id,
                name: ur.role.name,
                permissions: ur.role.permissions.map((rp) => rp.permission),
            })),
        };
        req.user = transformedUser;
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(403).json({
            success: false,
            message: "Invalid token",
        });
    }
};
exports.authenticateToken = authenticateToken;
const requirePermission = (permissionKey) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.roles) {
            return res.status(403).json({
                success: false,
                message: "Access denied - No roles assigned",
            });
        }
        const hasPermission = user.roles.some((role) => role.permissions?.some((permission) => permission.key === permissionKey));
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: "Access denied - Insufficient permissions",
                required: permissionKey,
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireRole = (roleName) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.roles) {
            return res.status(403).json({
                success: false,
                message: "Access denied - No roles assigned",
            });
        }
        const hasRole = user.roles.some((role) => role.name === roleName);
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: "Access denied - Insufficient role",
                required: roleName,
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map