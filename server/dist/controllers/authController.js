"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.register = exports.getRolePermissions = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const activityLogger_1 = require("../utils/activityLogger");
// export const login = async (req: Request, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation errors",
//         errors: errors.array(),
//       });
//     }
//     const { email, password } = req.body;
//     const user = await prisma.user.findFirst({
//       where: { email, isActive: true },
//       select: {
//         id: true,
//         email: true,
//         password: true,
//         firstName: true,
//         lastName: true,
//         lastLogin: true,
//         roles: {
//           select: {
//             role: {
//               select: {
//                 id: true,
//                 name: true,
//                 permissions: {
//                   select: {
//                     permission: {
//                       select: {
//                         id: true,
//                         name: true,
//                         key: true,
//                         module: true,
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }
//     // Update last login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLogin: new Date() },
//     });
//     // Log user login activity
//     await activityLoggers.userLogin({
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//     });
//     // Transform roles data
//     const transformedRoles = user.roles.map((ur) => ({
//       id: ur.role.id,
//       name: ur.role.name,
//       permissions: ur.role.permissions.map((rp) => rp.permission),
//     }));
//     const deviceId = req.headers["x-device-id"];
//     // Generate JWT token with expiry timestamp
//     const secret =
//       process.env.JWT_SECRET || "default-secret-change-in-production";
//     const expiresIn = process.env.JWT_EXPIRE || "24h";
//     const token = (jwt as any).sign(
//       {
//         userId: user.id,
//         email: user.email,
//         ip: req.ip,
//         userAgent: req.headers["user-agent"],
//         deviceId: deviceId || null,
//         roles: transformedRoles.map((role) => ({
//           id: role.id,
//           name: role.name,
//           permissions: role.permissions.map((perm) => perm.key),
//         })),
//       },
//       secret,
//       { expiresIn }
//     );
//     // Calculate expiry timestamp
//     const expiryTime = new Date();
//     expiryTime.setHours(expiryTime.getHours() + 24); // 24 hours from now
//     res.json({
//       success: true,
//       message: "Login successful",
//       data: {
//         token,
//         tokenExpiry: expiryTime.toISOString(),
//         user: {
//           id: user.id,
//           email: user.email,
//           // firstName: user.firstName,
//           // lastName: user.lastName,
//           fullName: `${user.firstName} ${user.lastName}`,
//           lastLogin: user.lastLogin,
//           roles: transformedRoles,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
// export const login = async (req: Request, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation errors",
//         errors: errors.array(),
//       });
//     }
//     const { email, password } = req.body;
//     const user = await prisma.user.findFirst({
//       where: { email, isActive: true },
//       select: {
//         id: true,
//         email: true,
//         password: true,
//         firstName: true,
//         lastName: true,
//         lastLogin: true,
//       },
//     });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLogin: new Date() },
//     });
//     await activityLoggers.userLogin({
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//     });
//     const deviceId = req.headers["x-device-id"];
//     const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
//     const expiresIn = process.env.JWT_EXPIRE || "24h";
//     const token = (jwt as any).sign(
//       {
//         userId: user.id,
//         email: user.email,
//         deviceId: deviceId || null,
//         ip: req.ip,
//         userAgent: req.headers["user-agent"],
//       },
//       secret,
//       { expiresIn }
//     );
//     const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     res.json({
//       success: true,
//       message: "Login successful",
//       data: {
//         token,
//         tokenExpiry: expiryTime.toISOString(),
//         user: {
//           id: user.id,
//           email: user.email,
//           fullName: `${user.firstName} ${user.lastName}`,
//           lastLogin: user.lastLogin,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
const login = async (req, res) => {
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
        const user = await prisma_1.prisma.user.findFirst({
            where: { email, isActive: true },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                lastLogin: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        await activityLogger_1.activityLoggers.userLogin({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });
        const userRoles = user.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
        }));
        const deviceId = req.headers["x-device-id"];
        const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
        const expiresIn = process.env.JWT_EXPIRE || "24h";
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            roles: userRoles.map((r) => ({ id: r.id, name: r.name })),
            deviceId: deviceId || null,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        }, secret, { expiresIn });
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                tokenExpiry: expiryTime.toISOString(),
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: `${user.firstName} ${user.lastName}`,
                    lastLogin: user.lastLogin,
                    roles: userRoles,
                },
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.login = login;
const getRolePermissions = async (req, res) => {
    try {
        const roleId = Number(req.params.roleId);
        const role = await prisma_1.prisma.role.findUnique({
            where: { id: roleId },
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
        });
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }
        res.json({
            success: true,
            data: {
                id: role.id,
                name: role.name,
                permissions: role.permissions.map((rp) => rp.permission),
            },
        });
    }
    catch (error) {
        console.error("Get role permissions error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getRolePermissions = getRolePermissions;
const register = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { email, password, firstName, lastName } = req.body;
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                createdAt: true,
            },
        });
        // Log activity for user registration
        await activityLogger_1.activityLoggers.userCreated({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }, user.id);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { user },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.register = register;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
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
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Transform roles data
        const transformedRoles = user.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            description: ur.role.description,
            permissions: ur.role.permissions.map((rp) => rp.permission),
        }));
        res.json({
            success: true,
            data: {
                user: {
                    ...user,
                    fullName: `${user.firstName} ${user.lastName}`,
                    roles: transformedRoles,
                },
            },
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map