"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.verifyEmail = exports.logout = exports.refreshToken = exports.resetPassword = exports.forgotPassword = exports.register = exports.getRolePermissions = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const passwordValidator_1 = __importDefault(require("../utils/passwordValidator"));
const security_1 = __importDefault(require("../middleware/security"));
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
        // Check if account is locked
        const isLocked = await security_1.default.checkAccountLocked(email);
        if (isLocked) {
            return res.status(423).json({
                success: false,
                message: "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
            });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: { email, isActive: true },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                lastLogin: true,
                emailVerified: true,
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
        if (!user || !(await passwordValidator_1.default.comparePassword(password, user.password))) {
            if (user) {
                await security_1.default.recordFailedLogin(email);
            }
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email address before logging in.",
                requiresEmailVerification: true,
            });
        }
        // Record successful login
        await security_1.default.recordSuccessfulLogin(email);
        // Transform roles data
        const transformedRoles = user.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: ur.role.permissions.map((rp) => rp.permission),
        }));
        const deviceId = req.headers["x-device-id"];
        const deviceInfo = req.deviceInfo;
        const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
        const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
        // Generate access token
        const payload = {
            userId: user.id,
            email: user.email,
            deviceId: deviceId || null,
            ip: req.ip || null,
            userAgent: req.headers["user-agent"] || null,
            roles: transformedRoles.map((role) => ({
                id: role.id,
                name: role.name,
                permissions: role.permissions.map((perm) => perm.key),
            })),
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
        // Generate refresh token
        const refreshToken = passwordValidator_1.default.generateSecureToken(64);
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        // Save refresh token to database
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });
        // Create login session
        await prisma_1.prisma.loginSession.create({
            data: {
                userId: user.id,
                token: accessToken,
                deviceInfo: deviceInfo?.userAgent || null,
                ipAddress: deviceInfo?.ipAddress || req.ip || null,
                userAgent: deviceInfo?.userAgent || null,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        await activityLogger_1.activityLoggers.userLogin({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
                tokenExpiry: expiryTime.toISOString(),
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: `${user.firstName} ${user.lastName}`,
                    lastLogin: user.lastLogin,
                    emailVerified: user.emailVerified,
                    roles: transformedRoles,
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
        // Validate password strength
        const passwordValidation = await passwordValidator_1.default.validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Password does not meet security requirements",
                errors: passwordValidation.errors,
            });
        }
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
        const hashedPassword = await passwordValidator_1.default.hashPassword(password);
        // Generate email verification token
        const emailVerificationToken = passwordValidator_1.default.generateSecureToken(32);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                emailVerificationToken,
                emailVerified: false,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                emailVerified: true,
                createdAt: true,
            },
        });
        // Save password to history
        await passwordValidator_1.default.savePasswordToHistory(user.id, hashedPassword);
        // Log activity for user registration
        await activityLogger_1.activityLoggers.userCreated({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }, user.id);
        // TODO: Send email verification email
        // await sendEmailVerificationEmail(user.email, emailVerificationToken);
        res.status(201).json({
            success: true,
            message: "User registered successfully. Please check your email to verify your account.",
            data: {
                user: {
                    ...user,
                    requiresEmailVerification: true,
                }
            },
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
const forgotPassword = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { email } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email, isActive: true },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: "If an account with that email exists, you will receive a password reset email.",
            });
        }
        // Generate reset token
        const resetToken = passwordValidator_1.default.generateSecureToken(32);
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetTokenExpiry,
            },
        });
        // TODO: Send password reset email
        // await sendPasswordResetEmail(user.email, resetToken);
        res.json({
            success: true,
            message: "If an account with that email exists, you will receive a password reset email.",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { token, password } = req.body;
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date(),
                },
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }
        // Validate password strength
        const passwordValidation = await passwordValidator_1.default.validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Password does not meet security requirements",
                errors: passwordValidation.errors,
            });
        }
        // Check password history
        const isPasswordReused = !(await passwordValidator_1.default.checkPasswordHistory(user.id, password));
        if (isPasswordReused) {
            return res.status(400).json({
                success: false,
                message: "You cannot reuse one of your last 5 passwords",
            });
        }
        // Hash new password
        const hashedPassword = await passwordValidator_1.default.hashPassword(password);
        // Update user password and clear reset token
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
                failedLoginAttempts: 0,
                accountLockedUntil: null,
            },
        });
        // Save password to history
        await passwordValidator_1.default.savePasswordToHistory(user.id, hashedPassword);
        // Revoke all existing refresh tokens for security
        await prisma_1.prisma.refreshToken.updateMany({
            where: { userId: user.id },
            data: { isRevoked: true },
        });
        // Deactivate all login sessions
        await prisma_1.prisma.loginSession.updateMany({
            where: { userId: user.id },
            data: { isActive: false },
        });
        res.json({
            success: true,
            message: "Password reset successfully. Please log in with your new password.",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.resetPassword = resetPassword;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required",
            });
        }
        const refreshTokenRecord = await prisma_1.prisma.refreshToken.findUnique({
            where: { token },
            include: {
                user: {
                    include: {
                        roles: {
                            include: {
                                role: {
                                    include: {
                                        permissions: {
                                            include: {
                                                permission: true,
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
        if (!refreshTokenRecord || refreshTokenRecord.isRevoked || refreshTokenRecord.expiresAt < new Date()) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }
        const user = refreshTokenRecord.user;
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User account is inactive",
            });
        }
        // Transform roles data
        const transformedRoles = user.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: ur.role.permissions.map((rp) => rp.permission),
        }));
        const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
        const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
        // Generate new access token
        const payload = {
            userId: user.id,
            email: user.email,
            roles: transformedRoles.map((role) => ({
                id: role.id,
                name: role.name,
                permissions: role.permissions.map((perm) => perm.key),
            })),
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken,
                tokenExpiry: expiryTime.toISOString(),
            },
        });
    }
    catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (userId) {
            // Revoke refresh tokens
            await prisma_1.prisma.refreshToken.updateMany({
                where: { userId },
                data: { isRevoked: true },
            });
            // Deactivate current session
            if (token) {
                await prisma_1.prisma.loginSession.updateMany({
                    where: {
                        userId,
                        token,
                        isActive: true,
                    },
                    data: { isActive: false },
                });
            }
            // Log logout activity
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            });
            if (user) {
                await activityLogger_1.activityLoggers.userLogout(user);
            }
        }
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.logout = logout;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerified: false,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifiedAt: new Date(),
                emailVerificationToken: null,
            },
        });
        res.json({
            success: true,
            message: "Email verified successfully. You can now log in.",
        });
    }
    catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.verifyEmail = verifyEmail;
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