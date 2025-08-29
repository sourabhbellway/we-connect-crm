"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getPermissions = void 0;
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const getPermissions = async (req, res) => {
    try {
        const permissions = await prisma_1.prisma.permission.findMany({
            orderBy: [{ module: "asc" }, { name: "asc" }],
        });
        res.json({
            success: true,
            data: { permissions },
        });
    }
    catch (error) {
        console.error("Get permissions error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getPermissions = getPermissions;
const createPermission = async (req, res) => {
    try {
        const { name, key, description, module } = req.body;
        const permission = await prisma_1.prisma.permission.create({
            data: {
                name,
                key,
                description,
                module,
            },
        });
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.permissionChanged("UPDATED", { permissionId: permission.id, key: permission.key, action: "CREATED" }, actorId);
        res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: { permission },
        });
    }
    catch (error) {
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
exports.createPermission = createPermission;
const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, description, module } = req.body;
        const permission = await prisma_1.prisma.permission.update({
            where: { id: parseInt(id) },
            data: {
                name,
                key,
                description,
                module,
            },
        });
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.permissionChanged("UPDATED", { permissionId: permission.id, key: permission.key, action: "UPDATED" }, actorId);
        res.json({
            success: true,
            message: "Permission updated successfully",
            data: { permission },
        });
    }
    catch (error) {
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
exports.updatePermission = updatePermission;
const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.permission.delete({
            where: { id: parseInt(id) },
        });
        const actorId = req?.user?.id;
        await activityLogger_1.activityLoggers.permissionChanged("REVOKED", { permissionId: parseInt(id), action: "DELETED" }, actorId);
        res.json({
            success: true,
            message: "Permission deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete permission error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deletePermission = deletePermission;
//# sourceMappingURL=permissionController.js.map