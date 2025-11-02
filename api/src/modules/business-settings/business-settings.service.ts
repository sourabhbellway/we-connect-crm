import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Map DB BusinessSettings to frontend CompanySettings shape
function mapToCompanySettings(bs: any) {
  return {
    id: String(bs.id),
    name: bs.companyName || '',
    email: bs.companyEmail || '',
    phone: bs.companyPhone || '',
    address: bs.companyAddress || '',
    website: bs.companyWebsite || '',
    logo: bs.companyLogo || null,
    timezone: bs.timeZone || 'UTC',
    fiscalYearStart: bs.fiscalYearStart || '',
    gstNumber: bs.gstNumber || '',
    panNumber: bs.panNumber || '',
    cinNumber: bs.cinNumber || '',
    industry: bs.industry || '',
    employeeCount: bs.employeeCount || '',
    description: bs.description || '',
    createdAt: bs.createdAt,
    updatedAt: bs.updatedAt,
  };
}

@Injectable()
export class BusinessSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseExtended(bs: any) {
    try {
      const ext = bs?.description ? JSON.parse(bs.description) : {};
      return {
        quotePrefix: ext.quotePrefix ?? 'Q-',
        quotePad: Number(ext.quotePad ?? 6),
        invoicePrefix: ext.invoicePrefix ?? 'INV-',
        invoicePad: Number(ext.invoicePad ?? 6),
        defaultTerms: ext.defaultTerms ?? '',
        paymentTerms: ext.paymentTerms ?? '',
        shippingTerms: ext.shippingTerms ?? '',
      };
    } catch {
      return {
        quotePrefix: 'Q-',
        quotePad: 6,
        invoicePrefix: 'INV-',
        invoicePad: 6,
        defaultTerms: '',
        paymentTerms: '',
        shippingTerms: '',
      };
    }
  }

  private async saveExtended(bs: any, patch: Partial<{ quotePrefix: string; quotePad: number; invoicePrefix: string; invoicePad: number; defaultTerms: string; paymentTerms: string; shippingTerms: string }>) {
    const current = this.parseExtended(bs);
    const next = { ...current, ...patch };
    await this.prisma.businessSettings.update({
      where: { id: bs.id },
      data: { description: JSON.stringify(next) },
    });
    return next;
  }

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
      data: mapToCompanySettings(bs),
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
        companyLogo: body.logo ?? bs.companyLogo,
        timeZone: body.timezone ?? bs.timeZone,
        gstNumber: body.gstNumber ?? bs.gstNumber,
        panNumber: body.panNumber ?? bs.panNumber,
        cinNumber: body.cinNumber ?? bs.cinNumber,
        fiscalYearStart: body.fiscalYearStart ?? bs.fiscalYearStart,
        industry: body.industry ?? bs.industry,
        employeeCount: body.employeeCount ?? bs.employeeCount,
        description: body.description ?? bs.description,
      },
    });
    return { success: true, data: mapToCompanySettings(updated) };
  }

  async uploadLogo(file: any) {
    // For now just pretend upload succeeded; extend to persist file path
    const bs = await this.ensureSettings();
    const updated = await this.prisma.businessSettings.update({
      where: { id: bs.id },
      data: { companyLogo: file?.originalname || 'logo.png' },
    });
    return {
      success: true,
      data: {
        logoUrl: `/uploads/${file?.filename || 'logo.png'}`,
        ...mapToCompanySettings(updated),
      },
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
      data: { defaultRate: 18, type: 'GST', inclusive: false },
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

  // Aggregate endpoint used by client context initialize
  async getAllBusinessSettings() {
    const bs = await this.ensureSettings();
    const company = mapToCompanySettings(bs);
    const numbering = this.parseExtended(bs);
    const leadSources = await this.prisma.leadSource.findMany({
      orderBy: { name: 'asc' },
    });
    const currency = {
      id: '1',
      baseCurrency: bs.currency || 'USD',
      decimalPlaces: 2,
      symbolPosition: 'before',
      thousandSeparator: ',',
      decimalSeparator: '.',
      autoUpdateRates: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    const tax = {
      id: '1',
      defaultTaxRate: 0,
      taxInclusive: false,
      showTaxNumber: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    return {
      success: true,
      data: { company, currency, tax, leadSources, pipelines: [], numbering },
    };
  }

  async getNumbering() {
    const bs = await this.ensureSettings();
    return { success: true, data: this.parseExtended(bs) };
  }

  async updateNumbering(body: any) {
    const bs = await this.ensureSettings();
    const updated = await this.saveExtended(bs, {
      quotePrefix: body.quotePrefix,
      quotePad: body.quotePad != null ? Number(body.quotePad) : undefined,
      invoicePrefix: body.invoicePrefix,
      invoicePad: body.invoicePad != null ? Number(body.invoicePad) : undefined,
      defaultTerms: body.defaultTerms,
      paymentTerms: body.paymentTerms,
      shippingTerms: body.shippingTerms,
    });
    return { success: true, data: updated };
  }

  async getPipelines() {
    // Return empty list for now to satisfy client
    return { success: true, data: [] };
  }
}
