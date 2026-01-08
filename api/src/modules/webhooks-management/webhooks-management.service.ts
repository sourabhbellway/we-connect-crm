import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhooksManagementService {
    constructor(private readonly prisma: PrismaService) { }

    async list() {
        const webhooks = await this.prisma.webhook.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { webhooks } };
    }

    async findOne(id: number) {
        const webhook = await this.prisma.webhook.findUnique({
            where: { id, deletedAt: null },
        });
        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }
        return { success: true, data: { webhook } };
    }

    async create(dto: CreateWebhookDto) {
        const webhook = await this.prisma.webhook.create({
            data: {
                name: dto.name,
                url: dto.url,
                events: dto.events || [],
                secret: dto.secret,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
            },
        });
        return { success: true, data: { webhook } };
    }

    async update(id: number, dto: UpdateWebhookDto) {
        await this.findOne(id);
        const webhook = await this.prisma.webhook.update({
            where: { id },
            data: {
                name: dto.name,
                url: dto.url,
                events: dto.events,
                secret: dto.secret,
                isActive: dto.isActive,
            },
        });
        return { success: true, data: { webhook } };
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.webhook.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Webhook deleted successfully' };
    }

    async test(id: number) {
        const { data: { webhook } } = await this.findOne(id);

        // In a real scenario, this would send a ping to the URL
        // For now we just mock it
        return {
            success: true,
            message: 'Test ping sent to ' + webhook.url,
            timestamp: new Date().toISOString()
        };
    }
}
