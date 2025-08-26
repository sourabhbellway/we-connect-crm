import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { activityLoggers } from "../utils/activityLogger";

export const getLeadSources = async (req: Request, res: Response) => {
  try {
    const leadSources = await prisma.leadSource.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }],
    });

    res.json({
      success: true,
      data: { leadSources },
    });
  } catch (error) {
    console.error("Get lead sources error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createLeadSource = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const leadSource = await prisma.leadSource.create({
      data: {
        name,
        description,
      },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.leadSourceChanged(
      "CREATED",
      { id: leadSource.id, name: leadSource.name },
      actorId
    );

    res.status(201).json({
      success: true,
      message: "Lead source created successfully",
      data: { leadSource },
    });
  } catch (error: any) {
    console.error("Create lead source error:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Lead source with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateLeadSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const leadSource = await prisma.leadSource.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        isActive,
      },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.leadSourceChanged(
      "UPDATED",
      { id: leadSource.id, name: leadSource.name },
      actorId
    );

    res.json({
      success: true,
      message: "Lead source updated successfully",
      data: { leadSource },
    });
  } catch (error) {
    console.error("Update lead source error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteLeadSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.leadSource.delete({
      where: { id: parseInt(id) },
    });

    const actorId = (req as any)?.user?.id;
    await activityLoggers.leadSourceChanged(
      "DELETED",
      { id: parseInt(id), name: "" },
      actorId
    );

    res.json({
      success: true,
      message: "Lead source deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead source error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
