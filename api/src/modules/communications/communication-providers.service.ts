import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TemplateType } from '@prisma/client';

@Injectable()
export class CommunicationProvidersService {
  private readonly logger = new Logger(CommunicationProvidersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listProviders() {
    const providers = await this.prisma.communicationProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      data: { providers },
    };
  }

  async createProvider(body: any) {
    const type = (body.type || 'EMAIL').toUpperCase() as TemplateType;
    const isDefault = !!body.isDefault;

    // Normalize config and persist provider identifier inside config
    const config: any = body.config || {};
    if (body.provider) {
      config.provider = body.provider;
    }

    // Ensure only one default per type (global for now)
    if (isDefault) {
      await this.prisma.communicationProvider.updateMany({
        where: { type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const provider = await this.prisma.communicationProvider.create({
      data: {
        name: body.name,
        type,
        config,
        isActive: body.isActive !== false,
        isDefault,
        // companyId can be wired later if you add multi-company context
      },
    });

    return {
      success: true,
      message: 'Provider created successfully',
      data: { provider },
    };
  }

  async updateProvider(id: number, body: any) {
    const existing = await this.prisma.communicationProvider.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: 'Provider not found' };
    }

    const type = (body.type || existing.type || 'EMAIL').toUpperCase() as TemplateType;
    const isDefault = body.isDefault ?? existing.isDefault;

    if (isDefault) {
      await this.prisma.communicationProvider.updateMany({
        where: { type, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Merge config and ensure provider identifier is stored
    const mergedConfig: any = {
      ...(existing as any).config,
      ...(body.config || {}),
    };
    if (body.provider) {
      mergedConfig.provider = body.provider;
    }

    const provider = await this.prisma.communicationProvider.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        type,
        config: mergedConfig,
        isActive: body.isActive ?? existing.isActive,
        isDefault,
      },
    });

    return {
      success: true,
      message: 'Provider updated successfully',
      data: { provider },
    };
  }

  async deleteProvider(id: number) {
    await this.prisma.communicationProvider.delete({ where: { id } });
    return { success: true, message: 'Provider deleted successfully' };
  }

  async testProvider(id: number, body: { testType?: string; recipient?: string }) {
    const provider = await this.prisma.communicationProvider.findUnique({ where: { id } });
    if (!provider) {
      return { success: false, message: 'Provider not found' };
    }

    const cfg: any = (provider as any).config || {};
    const recipient = body.recipient || (provider.type === 'EMAIL' ? cfg.fromEmail : undefined);

    if (!recipient) {
      return { success: false, message: 'Recipient not provided for test' };
    }

    // For now, implement real test only for SMTP email; others are stubbed
    if (provider.type === 'EMAIL') {
      const host = cfg.smtpHost || cfg.host;
      const port = cfg.smtpPort || cfg.port || 587;
      const user = cfg.smtpUser || cfg.username;
      const pass = cfg.smtpPassword || cfg.password;
      const from = cfg.fromEmail || cfg.from || user;
      const fromName = cfg.fromName;

      if (!host || !user || !pass || !from) {
        return { success: false, message: 'SMTP configuration incomplete for this provider' };
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });

        const appName = process.env.APP_NAME || 'WeConnect CRM';
        const fromHeader = fromName ? `${fromName} <${from}>` : from;

        await transporter.sendMail({
          from: fromHeader,
          to: recipient,
          subject: `${appName} communication provider test`,
          text: `This is a test email sent from ${appName} using the configured SMTP provider.`,
        });

        return { success: true, message: 'Test email sent successfully' };
      } catch (error) {
        this.logger.error('Test email failed', error?.stack || error);
        return { success: false, message: 'Test email failed', error: String(error?.message || error) };
      }
    }

    // Stub for non-email providers for now
    return {
      success: true,
      message: 'Test executed (no-op for this provider type)',
    };
  }
}
