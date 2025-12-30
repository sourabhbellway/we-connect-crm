import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CallStatus } from '@prisma/client';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';

@Injectable()
export class CallLogsService {
    constructor(private readonly prisma: PrismaService) { }

    async list({ leadId, userId, page = 1, limit = 10 }: { leadId?: number; userId?: number; page?: number; limit?: number }, user?: any) {
        try {
            console.log('🔍 Fetching call logs with filters:', { leadId, userId, page, limit, user });

            const where: any = {};
            if (leadId) where.leadId = leadId;
            if (userId) where.userId = userId;

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    if (where.OR || where.AND) {
                        where.AND = [
                            ...(where.AND || []),
                            roleBasedWhere
                        ];
                    } else {
                        Object.assign(where, roleBasedWhere);
                    }
                }
            }

            const [items, totalItems] = await Promise.all([
                this.prisma.callLog.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true } },
                        lead: { select: { id: true, firstName: true, lastName: true, company: true } },
                    },
                }),
                this.prisma.callLog.count({ where })
            ]);

            return {
                success: true,
                data: {
                    items,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalItems / limit),
                        totalItems: totalItems,
                        itemsPerPage: limit
                    }
                }
            };
        } catch (error) {
            console.error('❌ Error fetching call logs:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch call logs',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    async getById(id: number, user?: any) {
        try {
            console.log('🔍 Fetching call log by ID:', id);

            const where: any = { id };

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    console.log('🔐 Applying role-based filtering:', roleBasedWhere);
                    where.AND = [roleBasedWhere];
                }
            }

            console.log('📋 Final where clause:', where);

            const item = await this.prisma.callLog.findFirst({
                where,
            });

            if (!item) {
                console.log('❌ Call log not found');
                return { success: false, message: 'Call log not found' };
            }

            console.log('📊 Found call log:', item);

            return {
                success: true,
                data: {
                    item
                }
            };
        } catch (error) {
            console.error('❌ Error fetching call log by ID:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch call log',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    async create(dto: CreateCallLogDto) {
        try {
            console.log('📝 Creating call log:', dto);

            const item = await this.prisma.callLog.create({
                data: {
                    leadId: dto.leadId,
                    userId: dto.userId,
                    phoneNumber: dto.phoneNumber,
                    callType: (dto.callType as any) ?? 'OUTBOUND',
                    callStatus: (dto.callStatus as any) ?? 'INITIATED',
                    duration: dto.duration ?? null,
                    startTime: dto.startTime ? new Date(dto.startTime) : null,
                    endTime: dto.endTime ? new Date(dto.endTime) : null,
                    notes: dto.notes ?? null,
                    outcome: dto.outcome ?? null,
                    recordingUrl: dto.recordingUrl ?? null,
                    isAnswered: dto.isAnswered ?? false,
                    metadata: (dto.metadata as any) ?? undefined,
                },
            });

            console.log('✅ Call log created successfully:', item);

            // Log Activity
            try {
                await this.prisma.activity.create({
                    data: {
                        type: 'COMMUNICATION_LOGGED',
                        title: 'Call Logged',
                        description: `A call to ${item.phoneNumber} was logged.`,
                        userId: item.userId || 1,
                        leadId: item.leadId,
                        metadata: { callId: item.id } as any,
                    }
                });
            } catch (error) {
                console.error('Failed to log call activity:', error);
            }

            return {
                success: true,
                data: {
                    item
                }
            };
        } catch (error) {
            console.error('❌ Error creating call log:', error);
            return {
                success: false,
                message: error.message || 'Failed to create call log',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    async update(id: number, dto: UpdateCallLogDto) {
        try {
            console.log('📝 Updating call log:', { id, dto });

            const item = await this.prisma.callLog.update({
                where: { id },
                data: {
                    phoneNumber: dto.phoneNumber,
                    callType: dto.callType as any,
                    callStatus: dto.callStatus as any,
                    duration: dto.duration,
                    startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                    endTime: dto.endTime ? new Date(dto.endTime) : undefined,
                    notes: dto.notes,
                    outcome: dto.outcome,
                    recordingUrl: dto.recordingUrl,
                    isAnswered: dto.isAnswered,
                    metadata: dto.metadata as any,
                    updatedAt: new Date(),
                },
            });

            console.log('✅ Call log updated successfully:', item);

            return {
                success: true,
                data: {
                    item
                }
            };
        } catch (error) {
            console.error('❌ Error updating call log:', error);
            return {
                success: false,
                message: error.message || 'Failed to update call log',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    async remove(id: number) {
        try {
            console.log('🗑️ Deleting call log:', id);

            await this.prisma.callLog.delete({ where: { id } });

            console.log('✅ Call log deleted successfully');

            return {
                success: true,
                message: 'Call log deleted successfully'
            };
        } catch (error) {
            console.error('❌ Error deleting call log:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete call log',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    // Call logs by lead ID - frontend में उपयोग होने वाला method
    async getByLeadId(leadId: number, user?: any) {
        try {
            console.log('🔍 Fetching call logs for lead:', leadId);

            const where: any = { leadId };

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    console.log('🔐 Applying role-based filtering:', roleBasedWhere);
                    where.AND = [roleBasedWhere];
                }
            }

            console.log('📋 Final where clause:', where);

            const items = await this.prisma.callLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });

            console.log('📊 Found call logs for lead:', items.length);

            return {
                success: true,
                data: {
                    callLogs: items
                }
            };
        } catch (error) {
            console.error('❌ Error fetching call logs for lead:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch call logs for lead',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    // Call logs by user ID - additional utility method
    async getByUserId(userId: number, user?: any) {
        try {
            console.log('🔍 Fetching call logs for user:', userId);

            const where: any = { userId };

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    console.log('🔐 Applying role-based filtering:', roleBasedWhere);
                    where.AND = [roleBasedWhere];
                }
            }

            console.log('📋 Final where clause:', where);

            const items = await this.prisma.callLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true } },
                    lead: { select: { id: true, firstName: true, lastName: true, company: true } },
                },
            });

            console.log('📊 Found call logs for user:', items.length);

            return {
                success: true,
                data: {
                    callLogs: items
                }
            };
        } catch (error) {
            console.error('❌ Error fetching call logs for user:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch call logs for user',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    // Get call statistics
    async getStatistics(user?: any) {
        try {
            console.log('📊 Fetching call statistics');

            const where: any = {};

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    console.log('🔐 Applying role-based filtering:', roleBasedWhere);
                    where.AND = [roleBasedWhere];
                }
            }

            const totalCalls = await this.prisma.callLog.count({ where });
            const answeredCalls = await this.prisma.callLog.count({
                where: {
                    ...where,
                    isAnswered: true
                }
            });
            const completedCalls = await this.prisma.callLog.count({
                where: {
                    ...where,
                    callStatus: 'COMPLETED'
                }
            });

            const avgDuration = await this.prisma.callLog.aggregate({
                where: {
                    ...where,
                    isAnswered: true
                },
                _avg: {
                    duration: true
                }
            });

            console.log('📊 Call statistics:', {
                totalCalls,
                answeredCalls,
                completedCalls,
                avgDuration: avgDuration._avg.duration || 0
            });

            return {
                success: true,
                data: {
                    totalCalls,
                    answeredCalls,
                    completedCalls,
                    averageCallDuration: avgDuration._avg.duration || 0
                }
            };
        } catch (error) {
            console.error('❌ Error fetching call statistics:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch call statistics',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    // Update call status
    async updateStatus(id: number, status: string, user?: any) {
        try {
            console.log('📝 Updating call status:', { id, status });

            const where: any = { id };

            // Role-based filtering
            if (user && user.userId) {
                const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma, ['userId']);
                if (Object.keys(roleBasedWhere).length > 0) {
                    console.log('🔐 Applying role-based filtering:', roleBasedWhere);
                    where.AND = [roleBasedWhere];
                }
            }

            const item = await this.prisma.callLog.update({
                where,
                data: {
                    callStatus: status as CallStatus,
                    updatedAt: new Date(),
                },
            });

            // Log Activity
            try {
                await this.prisma.activity.create({
                    data: {
                        type: 'COMMUNICATION_LOGGED',
                        title: 'Call Status Updated',
                        description: `Call status to ${item.phoneNumber} updated to ${status}.`,
                        userId: item.userId || 1,
                        leadId: item.leadId,
                        metadata: { callId: item.id, status } as any,
                    }
                });
            } catch (error) {
                console.error('Failed to log call status activity:', error);
            }

            console.log('✅ Call status updated successfully:', item);

            return {
                success: true,
                data: {
                    item
                }
            };
        } catch (error) {
            console.error('❌ Error updating call status:', error);
            return {
                success: false,
                message: error.message || 'Failed to update call status',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }
}
