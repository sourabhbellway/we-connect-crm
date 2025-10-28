import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { activityLoggers } from "../utils/activityLogger";
import PasswordValidator from "../utils/passwordValidator";
import SecurityMiddleware from "../middleware/security";

interface AuthenticatedRequest extends Request {
  user?: any;
}

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

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Check if account is locked
    const isLocked = await SecurityMiddleware.checkAccountLocked(email);
    if (isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      });
    }

    const user = await prisma.user.findFirst({
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

    if (!user || !(await PasswordValidator.comparePassword(password, user.password))) {
      if (user) {
        await SecurityMiddleware.recordFailedLogin(email);
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
    await SecurityMiddleware.recordSuccessfulLogin(email);

    // Transform roles data
    const transformedRoles = user.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      permissions: ur.role.permissions.map((rp) => rp.permission),
    }));

    const deviceId = req.headers["x-device-id"] as string;
    const deviceInfo = (req as any).deviceInfo;
    const JWT_SECRET: string = process.env.JWT_SECRET || "fallback-secret-change-in-production";
    const expiresIn: string = process.env.JWT_EXPIRES_IN || "24h";

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
    const accessToken = (jwt as any).sign(payload, JWT_SECRET, { expiresIn });

    // Generate refresh token
    const refreshToken = PasswordValidator.generateSecureToken(64);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Create login session
    await prisma.loginSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        deviceInfo: deviceInfo?.userAgent || null,
        ipAddress: deviceInfo?.ipAddress || req.ip || null,
        userAgent: deviceInfo?.userAgent || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await activityLoggers.userLogin({
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.roleId);

    const role = await prisma.role.findUnique({
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
  } catch (error) {
    console.error("Get role permissions error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Validate password strength
    const passwordValidation = await PasswordValidator.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await PasswordValidator.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = PasswordValidator.generateSecureToken(32);

    // Create user
    const user = await prisma.user.create({
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
    await PasswordValidator.savePasswordToHistory(user.id, hashedPassword);

    // Log activity for user registration
    await activityLoggers.userCreated(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      user.id
    );

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
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({
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
    const resetToken = PasswordValidator.generateSecureToken(32);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
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
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
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
    const passwordValidation = await PasswordValidator.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
      });
    }

    // Check password history
    const isPasswordReused = !(await PasswordValidator.checkPasswordHistory(user.id, password));
    if (isPasswordReused) {
      return res.status(400).json({
        success: false,
        message: "You cannot reuse one of your last 5 passwords",
      });
    }

    // Hash new password
    const hashedPassword = await PasswordValidator.hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
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
    await PasswordValidator.savePasswordToHistory(user.id, hashedPassword);

    // Revoke all existing refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    // Deactivate all login sessions
    await prisma.loginSession.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const refreshTokenRecord = await prisma.refreshToken.findUnique({
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

    const JWT_SECRET: string = process.env.JWT_SECRET || "fallback-secret-change-in-production";
    const expiresIn: string = process.env.JWT_EXPIRES_IN || "24h";

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
    const accessToken = (jwt as any).sign(payload, JWT_SECRET, { expiresIn });

    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        tokenExpiry: expiryTime.toISOString(),
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (userId) {
      // Revoke refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });

      // Deactivate current session
      if (token) {
        await prisma.loginSession.updateMany({
          where: {
            userId,
            token,
            isActive: true,
          },
          data: { isActive: false },
        });
      }

      // Log logout activity
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (user) {
        await activityLoggers.userLogout(user);
      }
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
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

    await prisma.user.update({
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
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
