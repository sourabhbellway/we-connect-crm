import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { validationResult } from "express-validator";
import { activityLoggers } from "../utils/activityLogger";

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }],
    });

    res.json({
      success: true,
      data: { tags },
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, color, description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Tag with this name already exists",
      });
    }
    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        description,
      },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.tagChanged(
      "CREATED",
      { id: tag.id, name: tag.name },
      actorId
    );

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: { tag },
    });
  } catch (error: any) {
    console.error("Create tag error:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Tag with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const { name, color, description, isActive } = req.body;
    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }
    if (name && name.toLowerCase() !== existingTag.name.toLowerCase()) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          NOT: { id: parseInt(id) },
        },
      });

      if (duplicateTag) {
        return res.status(400).json({
          success: false,
          message: "Tag with this name already exists",
        });
      }
    }

    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        name,
        color,
        description,
        isActive,
      },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.tagChanged(
      "UPDATED",
      { id: tag.id, name: tag.name },
      actorId
    );

    res.json({
      success: true,
      message: "Tag updated successfully",
      data: { tag },
    });
  } catch (error) {
    console.error("Update tag error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "No tag found",
      });
    }
    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.tagChanged(
      "DELETED",
      { id: parseInt(id), name: "" },
      actorId
    );

    res.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
