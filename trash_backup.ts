import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrashService {
    private readonly logger = new Logger(TrashService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll({
        page = 1,
        limit = 10,
        type = 'all',
        search = '',
    }: {
        page?: number;
        limit?: number;
        type?: string;
        search?: string;
    }) {
        const skip = (page - 1) * limit;
        const take = Number(limit);

        const results: any[] = [];
        let totalItems = 0;

        const types = type === 'all' ? ['user', 'quotation', 'invoice', 'product', 'lead'] : [type];

        for (const t of types) {
            const where: any = { deletedAt: { not: null } };
            if (search) {
                if (t === 'user' || t === 'lead') {
                    where.OR = [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ];
                } else if (t === 'product') {
                    where.OR = [
                        { name: { contains: search, mode: 'insensitive' } },
                        { sku: { contains: search, mode: 'insensitive' } },
                    ];
                } else if (t === 'quotation') {
                    where.OR = [
                        { title: { contains: search, mode: 'insensitive' } },
                        { quotationNumber: { contains: search, mode: 'insensitive' } },
                    ];
                } else if (t === 'invoice') {
                    where.OR = [
                        { title: { contains: search, mode: 'insensitive' } },
                        { invoiceNumber: { contains: search, mode: 'insensitive' } },
                    ];
                }
            }

            const [items, count] = await Promise.all([
                (this.prisma[t as any] as any).findMany({
                    where,
                    orderBy: { deletedAt: 'desc' },
                }),
                (this.prisma[t as any] as any).count({ where }),
            ]);

            const mappedItems = items.map((item: any) => ({
                id: item.id,
                name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.title || item.quotationNumber || item.invoiceNumber || 'Unnamed',
                type: t,
                deletedAt: item.deletedAt,
                identifier: item.email || item.sku || item.quotationNumber || item.invoiceNumber || '',
            }));

            results.push(...mappedItems);
            totalItems += count;
        }

        // Sort by deletedAt desc globally if multiple types
        if (types.length > 1) {
            results.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
        }

        const paginatedResults = results.slice(skip, skip + take);

        return {
            success: true,
            data: {
                items: paginatedResults,
                pagination: {
                    totalItems,
                    currentPage: page,
                    pageSize: limit,
                    totalPages: Math.ceil(totalItems / limit),
                },
            },
        };
    }

    async restore(type: string, id: number) {
        if (!['user', 'quotation', 'invoice', 'product', 'lead'].includes(type)) {
            throw new NotFoundException('Invalid entity type');
        }

        await (this.prisma[type as any] as any).update({
            where: { id },
            data: { deletedAt: null },
        });

        return { success: true, message: `${type} restored successfully` };
    }

    async permanentDelete(type: string, id: number) {
        if (!['user', 'quotation', 'invoice', 'product', 'lead'].includes(type)) {
            throw new NotFoundException('Invalid entity type');
        }

        await (this.prisma[type as any] as any).delete({
            where: { id },
        });

        return { success: true, message: `${type} permanently deleted` };
    }

    async emptyTrash(type: string) {
        const types = type === 'all' ? ['user', 'quotation', 'invoice', 'product', 'lead'] : [type];

        for (const t of types) {
            await (this.prisma[t as any] as any).deleteMany({
                where: { deletedAt: { not: null } },
            });
        }

        return { success: true, message: 'Trash emptied successfully' };
    }

    async getStats() {
        const types = ['user', 'quotation', 'invoice', 'product', 'lead'];
        const stats: Record<string, number> = {};

        for (const t of types) {
            stats[t] = await (this.prisma[t as any] as any).count({
                where: { deletedAt: { not: null } }
            });
        }

        return {
            success: true,
            data: stats
        };
    }
}
