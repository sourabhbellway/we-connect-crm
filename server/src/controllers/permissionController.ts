import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { activityLoggers } from "../utils/activityLogger";

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { name: "asc" }],
    });

    res.json({
      success: true,
      data: { permissions },
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, key, description, module } = req.body;

    const permission = await prisma.permission.create({
      data: {
        name,
        key,
        description,
        module,
      },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.permissionChanged(
      "UPDATED",
      { permissionId: permission.id, key: permission.key, action: "CREATED" },
      actorId
    );

    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: { permission },
    });
  } catch (error: any) {
    console.error("Create permission error:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Permission with this key already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, key, description, module } = req.body;

    const permission = await prisma.permission.update({
      where: { id: parseInt(id) },
      data: {
        name,
        key,
        description,
        module,
      },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.permissionChanged(
      "UPDATED",
      { permissionId: permission.id, key: permission.key, action: "UPDATED" },
      actorId
    );

    res.json({
      success: true,
      message: "Permission updated successfully",
      data: { permission },
    });
  } catch (error: any) {
    console.error("Update permission error:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Permission with this key already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.permission.delete({
      where: { id: parseInt(id) },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.permissionChanged(
      "REVOKED",
      { permissionId: parseInt(id), action: "DELETED" },
      actorId
    );

    res.json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    console.error("Delete permission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
