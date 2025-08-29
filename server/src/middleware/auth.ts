import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const jwtSecret =
      process.env.JWT_SECRET || "default-secret-change-in-production";
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    // Check if this is a Super Admin token
    if (decoded.isSuperAdmin && decoded.superAdminId) {
      const superAdmin = await prisma.superAdmin.findUnique({
        where: { id: decoded.superAdminId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          roleAssignments: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  rolePermissions: {
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

      if (!superAdmin || !superAdmin.isActive) {
        return res.status(401).json({
          success: false,
          message: "Super Admin not found or inactive",
        });
      }

      // Transform Super Admin roles data
      const transformedSuperAdmin = {
        ...superAdmin,
        superAdminId: superAdmin.id,
        isSuperAdmin: true,
        roles: superAdmin.roleAssignments.map((ra) => ({
          id: ra.role.id,
          name: ra.role.name,
          permissions: ra.role.rolePermissions.map((rp) => rp.permission),
        })),
      };

      req.user = transformedSuperAdmin;
      next();
      return;
    }

    // Regular user authentication
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const requirePermission = (permissionKey: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.roles) {
      return res.status(403).json({
        success: false,
        message: "Access denied - No roles assigned",
      });
    }

    // Super Admins have access to everything
    if (user.isSuperAdmin === true) {
      return next();
    }

    const hasPermission = user.roles.some((role: any) =>
      role.permissions?.some(
        (permission: any) => permission.key === permissionKey
      )
    );

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

export const requireRole = (roleName: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.roles) {
      return res.status(403).json({
        success: false,
        message: "Access denied - No roles assigned",
      });
    }

    // Super Admins have access to everything
    if (user.isSuperAdmin === true) {
      return next();
    }

    const hasRole = user.roles.some((role: any) => role.name === roleName);

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
