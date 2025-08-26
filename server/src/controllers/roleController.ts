import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { activityLoggers } from "../utils/activityLogger";

export const getRoles = async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;

    // Default to showing all roles (both active and inactive)
    const whereClause = includeInactive === "false" ? { isActive: true } : {};

    const roles = await prisma.role.findMany({
      where: whereClause,
      orderBy: [{ name: "asc" }],
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    // Transform the data to match expected format
    const transformedRoles = roles.map((role) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
      users: role.users.map((ur) => ur.user),
    }));

    res.json({
      success: true,
      data: { roles: transformedRoles },
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, description, permissionIds } = req.body;

    // Check if role with this name already exists (including inactive ones)
    const existingRole = await prisma.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: existingRole.isActive
          ? "Role with this name already exists"
          : "Role with this name exists but is inactive. Please reactivate it or use a different name.",
        existingRole: {
          id: existingRole.id,
          name: existingRole.name,
          isActive: existingRole.isActive,
        },
      });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions:
          permissionIds && permissionIds.length > 0
            ? {
                create: permissionIds.map((permissionId: number) => ({
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

    // Log
    const actorId = (req as any)?.user?.id;
    await activityLoggers.roleChanged(
      "CREATED",
      { id: role.id, name: role.name },
      actorId
    );

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: { role: transformedRole },
    });
  } catch (error: any) {
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

export const updateRole = async (req: Request, res: Response) => {
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
    const { name, description, isActive, permissionIds } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        isActive,
        permissions: {
          deleteMany: {},
          create:
            permissionIds && permissionIds.length > 0
              ? permissionIds.map((permissionId: number) => ({
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

    // Log
    const actorId = (req as any)?.user?.id;
    await activityLoggers.roleChanged(
      "UPDATED",
      { id: role.id, name: role.name },
      actorId
    );

    res.json({
      success: true,
      message: "Role updated successfully",
      data: { role: transformedRole },
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await prisma.role.delete({
      where: { id: parseInt(id) },
    });

    // Log
    const actorId = (req as any)?.user?.id;
    await activityLoggers.roleChanged(
      "DELETED",
      { id: existingRole.id, name: existingRole.name },
      actorId
    );

    res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
