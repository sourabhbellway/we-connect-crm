import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertIntegrationDto } from './dto/upsert-integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.thirdPartyIntegration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: { items } };
  }

  async create(dto: UpsertIntegrationDto) {
    const item = await this.prisma.thirdPartyIntegration.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description ?? null,
        isActive: dto.isActive ?? true,
        apiEndpoint: dto.apiEndpoint,
        authType: (dto.authType as any) ?? 'API_KEY',
        config: (dto.config as any) ?? undefined,
      },
    });
    return { success: true, data: { integration: item } };
  }

  async update(id: number, dto: UpsertIntegrationDto) {
    const item = await this.prisma.thirdPartyIntegration.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        description: dto.description,
        isActive: dto.isActive,
        apiEndpoint: dto.apiEndpoint,
        authType: dto.authType as any,
        config: dto.config as any,
        updatedAt: new Date(),
      },
    });
    return { success: true, data: { integration: item } };
  }

  async logs(integrationId: number) {
    const items = await this.prisma.integrationLog.findMany({
      where: { integrationId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: { items } };
  }
}
