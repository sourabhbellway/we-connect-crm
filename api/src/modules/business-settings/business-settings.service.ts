import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BusinessSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSettings() {
    let bs = await this.prisma.businessSettings.findFirst();
    if (!bs) {
      bs = await this.prisma.businessSettings.create({
        data: { companyName: 'Your Company' },
      });
    }
    return bs;
  }

  async getCompany() {
    const bs = await this.ensureSettings();
    return {
      success: true,
      data: {
        name: bs.companyName,
        email: bs.companyEmail,
        phone: bs.companyPhone,
        address: bs.companyAddress,
        website: bs.companyWebsite,
        logo: bs.companyLogo,
      },
    };
  }

  async updateCompany(body: any) {
    const bs = await this.ensureSettings();
    const updated = await this.prisma.businessSettings.update({
      where: { id: bs.id },
      data: {
        companyName: body.name ?? bs.companyName,
        companyEmail: body.email ?? bs.companyEmail,
        companyPhone: body.phone ?? bs.companyPhone,
        companyAddress: body.address ?? bs.companyAddress,
        companyWebsite: body.website ?? bs.companyWebsite,
      },
    });
    return { success: true, data: updated };
  }

  async uploadLogo(file: any) {
    // For now just pretend upload succeeded; extend to persist file path
    const bs = await this.ensureSettings();
    await this.prisma.businessSettings.update({
      where: { id: bs.id },
      data: { companyLogo: file?.originalname || 'logo.png' },
    });
    return {
      success: true,
      data: { logoUrl: `/uploads/${file?.filename || 'logo.png'}` },
    };
  }

  async getCurrency() {
    const bs = await this.ensureSettings();
    return { success: true, data: { currency: bs.currency } };
  }

  async updateCurrency(body: any) {
    const bs = await this.ensureSettings();
    const updated = await this.prisma.businessSettings.update({
      where: { id: bs.id },
      data: { currency: body.currency ?? bs.currency },
    });
    return { success: true, data: updated };
  }

  async getTax() {
    const bs = await this.ensureSettings();
    return {
      success: true,
      data: { defaultRate: bs.passwordRequireNumber ? 18 : 18 },
    };
  }

  async updateTax(body: any) {
    // Placeholder: map to your schema fields
    return { success: true };
  }

  async listLeadSources() {
    const items = await this.prisma.leadSource.findMany();
    return { success: true, data: items };
  }
  async createLeadSource(body: any) {
    const ls = await this.prisma.leadSource.create({
      data: { name: body.name, description: body.description ?? null },
    });
    return { success: true, data: ls };
  }
  async updateLeadSource(body: any) {
    const ls = await this.prisma.leadSource.update({
      where: { id: Number(body.id) },
      data: { name: body.name, description: body.description ?? null },
    });
    return { success: true, data: ls };
  }
}
