import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) { }

  async list(leadId: number, user?: any) {
    try {
      const where: any = {
        leadId,
        deletedAt: null,
      };

      // Role-based filtering
      if (user && user.userId) {
        const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
        if (Object.keys(roleBasedWhere).length > 0) {
          where.AND = [roleBasedWhere];
        }
      }

      const notes = await this.prisma.note.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return { success: true, data: { notes } };
    } catch (error: any) {
      console.error('Error in notes.list:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: number, user?: any) {
    try {
      const where: any = { id, deletedAt: null };

      // Role-based filtering
      if (user && user.userId) {
        const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
        if (Object.keys(roleBasedWhere).length > 0) {
          where.AND = [roleBasedWhere];
        }
      }

      const note = await this.prisma.note.findFirst({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!note) {
        return { success: false, message: 'Note not found' };
      }

      return { success: true, data: { note } };
    } catch (error: any) {
      console.error('Error in notes.getById:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(dto: CreateNoteDto) {
    try {
      const note = await this.prisma.note.create({
        data: {
          title: dto.title,
          content: dto.content,
          isPinned: dto.isPinned ?? false,
          leadId: dto.leadId,
          createdBy: dto.createdBy,
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
        },
      });

      // Create activity for note creation
      try {
        await this.prisma.activity.create({
          data: {
            title: 'Note added',
            description: `Note "${note.title}" added`,
            type: 'COMMUNICATION_LOGGED' as any,
            icon: 'MessageSquare',
            iconColor: '#6B7280',
            metadata: {
              noteId: note.id,
              title: note.title,
            } as any,
            userId: dto.createdBy,
            leadId: dto.leadId,
          },
        });
      } catch (activityError) {
        console.error('Error creating note activity:', activityError);
        // Don't fail note creation if activity creation fails
      }

      return { success: true, data: { note } };
    } catch (error: any) {
      console.error('Error in notes.create:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, dto: UpdateNoteDto) {
    try {
      const existingNote = await this.prisma.note.findFirst({
        where: { id, deletedAt: null },
      });

      if (!existingNote) {
        return { success: false, message: 'Note not found' };
      }

      const note = await this.prisma.note.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.content && { content: dto.content }),
          ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
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
        },
      });

      // Create activity for note update
      try {
        await this.prisma.activity.create({
          data: {
            title: 'Note updated',
            description: `Note "${note.title}" updated`,
            type: 'COMMUNICATION_LOGGED' as any,
            icon: 'Edit',
            iconColor: '#3B82F6',
            metadata: {
              noteId: note.id,
              title: note.title,
            } as any,
            userId: existingNote.createdBy,
            leadId: existingNote.leadId,
          },
        });
      } catch (activityError) {
        console.error('Error creating note update activity:', activityError);
      }

      return { success: true, data: { note } };
    } catch (error: any) {
      console.error('Error in notes.update:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const note = await this.prisma.note.findFirst({
        where: { id, deletedAt: null },
      });

      if (!note) {
        return { success: false, message: 'Note not found' };
      }

      await this.prisma.note.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // Create activity for note deletion
      try {
        await this.prisma.activity.create({
          data: {
            title: 'Note deleted',
            description: `Note "${note.title}" deleted`,
            type: 'COMMUNICATION_LOGGED' as any,
            icon: 'Trash2',
            iconColor: '#EF4444',
            metadata: {
              noteId: note.id,
              title: note.title,
            } as any,
            userId: note.createdBy,
            leadId: note.leadId,
          },
        });
      } catch (activityError) {
        console.error('Error creating note delete activity:', activityError);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in notes.remove:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

