import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
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

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles:
          roleIds && roleIds.length > 0
            ? {
                create: roleIds.map((roleId: number) => ({
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
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
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
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        firstName,
        lastName,
        isActive,
        roles: {
          deleteMany: {},
          create:
            roleIds && roleIds.length > 0
              ? roleIds.map((roleId: number) => ({
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
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Helper function for password hashing
async function hashPassword(password: string): Promise<string> {
  const bcrypt = require("bcryptjs");
  return bcrypt.hash(password, 12);
}
