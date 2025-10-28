import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma, CallType, CallStatus } from '@prisma/client';

// Interface for creating call logs
interface CreateCallLogRequest {
  leadId: number;
  phoneNumber: string;
  callType: CallType;
  notes?: string;
  outcome?: string;
}

// Interface for updating call logs
interface UpdateCallLogRequest {
  callStatus?: CallStatus;
  duration?: number;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  outcome?: string;
  isAnswered?: boolean;
  recordingUrl?: string;
}

// Get all call logs for a lead
export const getCallLogsForLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check if lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: parseInt(leadId),
        isActive: true,
        deletedAt: null,
      },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Get call logs with pagination
    const [callLogs, total] = await Promise.all([
      prisma.callLog.findMany({
        where: {
          leadId: parseInt(leadId),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.callLog.count({
        where: {
          leadId: parseInt(leadId),
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        callLogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call logs',
      error: error.message,
    });
  }
};

// Get all call logs for a user
export const getCallLogsForUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [callLogs, total] = await Promise.all([
      prisma.callLog.findMany({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              company: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.callLog.count({
        where: {
          userId,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        callLogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching user call logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call logs',
      error: error.message,
    });
  }
};

// Create a new call log
export const createCallLog = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId, phoneNumber, callType, notes, outcome }: CreateCallLogRequest = req.body;

    // Validate required fields
    if (!leadId || !phoneNumber || !callType) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID, phone number, and call type are required',
      });
    }

    // Check if lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Create call log
    const callLog = await prisma.callLog.create({
      data: {
        leadId,
        userId,
        phoneNumber,
        callType,
        callStatus: CallStatus.INITIATED,
        notes,
        outcome,
        startTime: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        title: `Call ${callType.toLowerCase()} initiated`,
        description: `${callType.toLowerCase()} call to ${phoneNumber} for ${lead.firstName} ${lead.lastName}`,
        type: 'COMMUNICATION_LOGGED',
        icon: 'FiPhone',
        iconColor: 'text-green-600',
        userId,
        metadata: {
          callLogId: callLog.id,
          leadId,
          phoneNumber,
          callType,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Call log created successfully',
      data: { callLog },
    });
  } catch (error: any) {
    console.error('Error creating call log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create call log',
      error: error.message,
    });
  }
};

// Update a call log
export const updateCallLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const updateData: UpdateCallLogRequest = req.body;

    // Check if call log exists and user has access
    const existingCallLog = await prisma.callLog.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingCallLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found or access denied',
      });
    }

    // Calculate duration if start and end times are provided
    if (updateData.startTime && updateData.endTime) {
      updateData.duration = Math.floor(
        (new Date(updateData.endTime).getTime() - new Date(updateData.startTime).getTime()) / 1000
      );
    }

    // Update call log
    const callLog = await prisma.callLog.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    // Create activity log for significant updates
    if (updateData.callStatus === CallStatus.COMPLETED) {
      await prisma.activity.create({
        data: {
          title: `Call completed`,
          description: `Call with ${callLog.lead.firstName} ${callLog.lead.lastName} completed${
            updateData.duration ? ` (${Math.floor(updateData.duration / 60)}:${(updateData.duration % 60).toString().padStart(2, '0')})` : ''
          }`,
          type: 'COMMUNICATION_LOGGED',
          icon: 'FiPhone',
          iconColor: 'text-green-600',
          userId,
          metadata: {
            callLogId: callLog.id,
            leadId: callLog.leadId,
            duration: updateData.duration,
            outcome: updateData.outcome,
          },
        },
      });
    }

    res.json({
      success: true,
      message: 'Call log updated successfully',
      data: { callLog },
    });
  } catch (error: any) {
    console.error('Error updating call log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update call log',
      error: error.message,
    });
  }
};

// Delete a call log
export const deleteCallLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Check if call log exists and user has access
    const existingCallLog = await prisma.callLog.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingCallLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found or access denied',
      });
    }

    // Delete call log
    await prisma.callLog.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({
      success: true,
      message: 'Call log deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting call log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete call log',
      error: error.message,
    });
  }
};

// Initiate call and send notification to mobile app
export const initiateCall = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId, phoneNumber, deviceToken } = req.body;

    // Validate required fields
    if (!leadId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID and phone number are required',
      });
    }

    // Check if lead exists
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Create call log
    const callLog = await prisma.callLog.create({
      data: {
        leadId,
        userId,
        phoneNumber,
        callType: CallType.OUTBOUND,
        callStatus: CallStatus.INITIATED,
        startTime: new Date(),
      },
    });

    // Here you would integrate with Firebase Cloud Messaging or other notification service
    // For now, we'll simulate the notification
    const notificationPayload = {
      type: 'call_request',
      callLogId: callLog.id,
      leadId,
      leadName: `${lead.firstName} ${lead.lastName}`,
      phoneNumber,
      timestamp: new Date().toISOString(),
    };

    // TODO: Send notification to mobile app using FCM
    // await sendNotificationToDevice(deviceToken, notificationPayload);

    res.json({
      success: true,
      message: 'Call initiated and notification sent',
      data: {
        callLog,
        notificationPayload,
      },
    });
  } catch (error: any) {
    console.error('Error initiating call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call',
      error: error.message,
    });
  }
};

// Get call analytics/stats
export const getCallAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { startDate, endDate, leadId } = req.query;

    let whereClause: any = {
      userId,
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (leadId) {
      whereClause.leadId = parseInt(leadId as string);
    }

    const [
      totalCalls,
      answeredCalls,
      completedCalls,
      averageDuration,
      callsByStatus,
    ] = await Promise.all([
      prisma.callLog.count({ where: whereClause }),
      prisma.callLog.count({
        where: { ...whereClause, isAnswered: true }
      }),
      prisma.callLog.count({
        where: { ...whereClause, callStatus: CallStatus.COMPLETED }
      }),
      prisma.callLog.aggregate({
        where: { ...whereClause, duration: { not: null } },
        _avg: { duration: true }
      }),
      prisma.callLog.groupBy({
        by: ['callStatus'],
        where: whereClause,
        _count: { callStatus: true }
      })
    ]);

    const analytics = {
      totalCalls,
      answeredCalls,
      completedCalls,
      missedCalls: totalCalls - answeredCalls,
      answerRate: totalCalls > 0 ? ((answeredCalls / totalCalls) * 100).toFixed(2) : '0',
      completionRate: totalCalls > 0 ? ((completedCalls / totalCalls) * 100).toFixed(2) : '0',
      averageDuration: averageDuration._avg.duration ? Math.round(averageDuration._avg.duration) : 0,
      callsByStatus: callsByStatus.reduce((acc, item) => {
        acc[item.callStatus] = item._count.callStatus;
        return acc;
      }, {} as Record<string, number>),
    };

    res.json({
      success: true,
      data: { analytics },
    });
  } catch (error: any) {
    console.error('Error fetching call analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call analytics',
      error: error.message,
    });
  }
};