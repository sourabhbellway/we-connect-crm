import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailTemplateCategory } from '@prisma/client';

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
  constructor(private readonly prisma: PrismaService) { }
  private generateUniqueColor() {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

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
    // Ensure a unique color is generated if not provided
    let color = body.color;
    if (!color) {
      let isUnique = false;
      while (!isUnique) {
        color = this.generateUniqueColor();
        const exists = await this.prisma.leadSource.findUnique({
          where: { color },
        });
        if (!exists) isUnique = true;
      }
    }

    const ls = await this.prisma.leadSource.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        color,
      },
    });

    return { success: true, data: ls };
  }

  async updateLeadSource(body: any) {
    const data: any = {
      name: body.name,
      description: body.description ?? null,
    };

    if (body.color !== undefined) data.color = body.color;

    const ls = await this.prisma.leadSource.update({
      where: { id: Number(body.id) },
      data,
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

  // Integrations: provide available integration definitions, status and settings
  async getAvailableIntegrations() {
    // Minimal set of integrations; extend as needed
    const integrations = [
      {
        name: 'meta-ads',
        displayName: 'Meta Ads (Facebook/Instagram)',
        description: 'Import leads from Meta Ads (Facebook / Instagram lead forms).',
        fields: [
          { name: 'apiKey', label: 'API Key', type: 'text', required: true },
          { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
        ],
        instructions: 'Enter your Meta App credentials and enable syncing to import leads from campaigns.',
      },
      {
        name: 'indiamart',
        displayName: 'IndiaMART',
        description: 'Import leads from IndiaMART enquiries.',
        fields: [
          { name: 'apiKey', label: 'API Key', type: 'text', required: true },
        ],
        instructions: 'Generate an API key on IndiaMART and paste it here. Enable syncing to pull leads.',
      },
      {
        name: 'tradindia',
        displayName: 'TradeIndia',
        description: 'Import leads from TradeIndia enquiries.',
        fields: [
          { name: 'apiKey', label: 'API Key', type: 'text', required: true },
          { name: 'apiSecret', label: 'API Secret', type: 'password', required: false },
        ],
        instructions: 'Provide TradeIndia API credentials to sync leads.',
      },
    ];

    return { success: true, data: { integrations } };
  }

  async getIntegrationsStatus() {
    const bs = await this.ensureSettings();
    let ext: any = {};
    try {
      ext = bs.description ? JSON.parse(bs.description) : {};
    } catch {
      ext = {};
    }

    const integrationsState: Record<string, any> = {};

    // For keys we store settings under ext.integrations if present
    const cfg = ext.integrations || {};

    const list = ['meta-ads', 'indiamart', 'tradindia'];
    for (const name of list) {
      const key = name.replace(/-/g, '');
      const item = cfg[key] || {};
      const configured = Boolean(item.apiKey || item.apiKey === '' ? item.apiKey : false) || Boolean(item.apiSecret);
      integrationsState[key] = {
        enabled: Boolean(item.enabled) || false,
        configured: configured,
      };
    }

    return { success: true, data: { integrations: integrationsState } };
  }

  async getIntegrationSettings() {
    const bs = await this.ensureSettings();
    let ext: any = {};
    try {
      ext = bs.description ? JSON.parse(bs.description) : {};
    } catch {
      ext = {};
    }

    const settings = ext.integrations || {};
    return { success: true, data: { settings } };
  }

  async updateIntegrationSettings(body: any) {
    const bs = await this.ensureSettings();
    let ext: any = {};
    try {
      ext = bs.description ? JSON.parse(bs.description) : {};
    } catch {
      ext = {};
    }

    ext.integrations = { ...(ext.integrations || {}), ...(body || {}) };

    const updated = await this.prisma.businessSettings.update({
      where: { id: bs.id },
      data: { description: JSON.stringify(ext) },
    });

    return { success: true, data: ext.integrations };
  }

  async testIntegration(name: string) {
    // Minimal simulated test. In real implementation, perform API handshake.
    return { success: true, data: { success: true, message: `${name} connection successful (simulated)` } };
  }

  async syncIntegration(name: string) {
    // Simulated sync response; implement real sync logic as needed.
    return { success: true, data: { synced: 0, message: `${name} sync executed (simulated)` } };
  }

  // Quotation Templates Methods
  async listQuotationTemplates() {
    const templates = await this.prisma.quotationTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: templates };
  }

  async createQuotationTemplate(body: any) {
    // If this template is set as default, unset any existing default
    if (body.isDefault) {
      await this.prisma.quotationTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await this.prisma.quotationTemplate.create({
      data: {
        name: body.name,
        description: body.description || null,
        headerContent: body.headerContent || null,
        footerContent: body.footerContent || null,
        termsAndConditions: body.termsAndConditions || null,
        validityDays: body.validityDays || 30,
        showTax: body.showTax !== undefined ? body.showTax : true,
        showDiscount: body.showDiscount !== undefined ? body.showDiscount : true,
        logoPosition: body.logoPosition || 'left',
        isDefault: body.isDefault || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        styles: body.styles || null,
      },
    });
    return { success: true, data: template };
  }

  async updateQuotationTemplate(id: number, body: any) {
    // If this template is being set as default, unset any existing default
    if (body.isDefault) {
      await this.prisma.quotationTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await this.prisma.quotationTemplate.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        description: body.description || null,
        headerContent: body.headerContent || null,
        footerContent: body.footerContent || null,
        termsAndConditions: body.termsAndConditions || null,
        validityDays: body.validityDays,
        showTax: body.showTax,
        showDiscount: body.showDiscount,
        logoPosition: body.logoPosition,
        isDefault: body.isDefault,
        isActive: body.isActive,
        styles: body.styles || null,
      },
    });
    return { success: true, data: template };
  }

  async deleteQuotationTemplate(id: number) {
    // Don't allow deletion of default template
    const template = await this.prisma.quotationTemplate.findUnique({
      where: { id: Number(id) },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.isDefault) {
      throw new Error('Cannot delete default template');
    }

    await this.prisma.quotationTemplate.delete({
      where: { id: Number(id) },
    });
    return { success: true };
  }

  async setDefaultQuotationTemplate(id: number) {
    // First unset any existing default
    await this.prisma.quotationTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    // Then set the new default
    const template = await this.prisma.quotationTemplate.update({
      where: { id: Number(id) },
      data: { isDefault: true },
    });
    return { success: true, data: template };
  }

  // Email Template Management Methods
  async getEmailTemplates() {
    const templates = await this.prisma.emailTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: templates };
  }

  async createEmailTemplate(body: any) {
    const template = await this.prisma.emailTemplate.create({
      data: {
        name: body.name,
        category: body.category || 'WELCOME',
        type: body.type || 'EMAIL',
        subject: body.subject,
        htmlContent: body.htmlContent,
        textContent: body.textContent,
        variables: body.variables || {},
        metadata: body.metadata || {},
        status: body.status || 'ACTIVE',
        isActive: body.isActive !== undefined ? body.isActive : true,
        isDefault: body.isDefault || false,
        companyId: body.companyId || null,
        createdBy: body.createdBy,
      },
    });
    return { success: true, data: template };
  }

  async updateEmailTemplate(id: number, body: any) {
    const template = await this.prisma.emailTemplate.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        category: body.category,
        subject: body.subject,
        htmlContent: body.htmlContent,
        textContent: body.textContent,
        variables: body.variables,
        metadata: body.metadata,
        status: body.status,
        isActive: body.isActive,
        isDefault: body.isDefault,
      },
    });
    return { success: true, data: template };
  }

  async deleteEmailTemplate(id: number) {
    // Soft delete by setting deletedAt
    const template = await this.prisma.emailTemplate.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
    return { success: true, data: template };
  }

  async setDefaultEmailTemplate(id: number, category: EmailTemplateCategory) {
    // First unset any existing default for this category
    await this.prisma.emailTemplate.updateMany({
      where: { 
        category: category,
        isDefault: true,
        deletedAt: null 
      },
      data: { isDefault: false },
    });

    // Then set the new default
    const template = await this.prisma.emailTemplate.update({
      where: { id: Number(id) },
      data: { isDefault: true },
    });
    return { success: true, data: template };
  }

  async getEmailTemplatesByCategory(category: EmailTemplateCategory) {
    const templates = await this.prisma.emailTemplate.findMany({
      where: {
        category: category,
        isActive: true,
        deletedAt: null,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    });
    return { success: true, data: templates };
  }

  async getWelcomeEmailTemplate() {
    // Get the default welcome email template
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        category: 'WELCOME',
        isDefault: true,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!template) {
      // Return a default welcome template if none exists
      return {
        success: true,
        data: {
          id: null,
          name: 'Default Welcome Template',
          category: 'WELCOME',
          subject: '{appName} - Welcome {firstName}',
          htmlContent: `
            <p>Hello {firstName},</p>
            <p>Your account has been created on <b>{appName}</b>.</p>
            <p>Login email: {email}<br/>
            Temporary password: {password}</p>
            <p>Please log in and change your password after first login.</p>
            <p>If you did not expect this email, please contact your administrator.</p>
          `,
          textContent: `
            Hello {firstName},

            Your account has been created on {appName}.

            Login email: {email}
            Temporary password: {password}

            Please log in and change your password after first login.

            If you did not expect this email, please contact your administrator.
          `,
          variables: ['firstName', 'email', 'password', 'appName'],
        },
      };
    }

    return { success: true, data: template };
  }

  async getSystemEmailTemplate(category: EmailTemplateCategory) {
    // Get the default template for the specified category
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        category: category,
        isDefault: true,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!template) {
      // Return default templates based on category
      const defaults: Record<string, any> = {
        WELCOME: {
          name: 'Default Welcome Template',
          subject: '{appName} - Welcome {firstName}',
          htmlContent: `
            <p>Hello {firstName},</p>
            <p>Your account has been created on <b>{appName}</b>.</p>
            <p>Login email: {email}<br/>
            Temporary password: {password}</p>
            <p>Please log in and change your password after first login.</p>
            <p>If you did not expect this email, please contact your administrator.</p>
          `,
          textContent: `
            Hello {firstName},

            Your account has been created on {appName}.

            Login email: {email}
            Temporary password: {password}

            Please log in and change your password after first login.

            If you did not expect this email, please contact your administrator.
          `,
          variables: ['firstName', 'email', 'password', 'appName'],
        },
        EMAIL_VERIFICATION: {
          name: 'Default Email Verification Template',
          subject: '{appName} - Verify Your Email',
          htmlContent: `
            <p>Hello {firstName},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="{verificationLink}">Verify Email</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not request this, please ignore this email.</p>
          `,
          textContent: `
            Hello {firstName},

            Please verify your email address by clicking the link below:
            {verificationLink}

            This link will expire in 24 hours.

            If you did not request this, please ignore this email.
          `,
          variables: ['firstName', 'verificationLink', 'appName'],
        },
        PASSWORD_RESET: {
          name: 'Default Password Reset Template',
          subject: '{appName} - Reset Your Password',
          htmlContent: `
            <p>Hello {firstName},</p>
            <p>You have requested to reset your password. Click the link below to reset it:</p>
            <p><a href="{resetLink}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
          `,
          textContent: `
            Hello {firstName},

            You have requested to reset your password. Click the link below to reset it:
            {resetLink}

            This link will expire in 1 hour.

            If you did not request this, please ignore this email.
          `,
          variables: ['firstName', 'resetLink', 'appName'],
        },
      };

      const defaultTemplate = defaults[category] || defaults['WELCOME'];
      return {
        success: true,
        data: {
          id: null,
          name: defaultTemplate.name,
          category: category,
          subject: defaultTemplate.subject,
          htmlContent: defaultTemplate.htmlContent,
          textContent: defaultTemplate.textContent,
          variables: defaultTemplate.variables,
        },
      };
    }

    return { success: true, data: template };
  }

  async upsertWelcomeEmailTemplate(body: any) {
    // Ensure only one default welcome template exists
    if (body.isDefault) {
      await this.prisma.emailTemplate.updateMany({
        where: { category: 'WELCOME', isDefault: true, deletedAt: null },
        data: { isDefault: false },
      });
    }

    // Try find existing default welcome template
    const existing = await this.prisma.emailTemplate.findFirst({
      where: { category: 'WELCOME', isDefault: true, deletedAt: null },
    });

    if (existing) {
      const updated = await this.prisma.emailTemplate.update({
        where: { id: existing.id },
        data: {
          name: body.name ?? existing.name,
          subject: body.subject ?? existing.subject,
          htmlContent: body.htmlContent ?? existing.htmlContent,
          textContent: body.textContent ?? existing.textContent,
          variables: body.variables ?? existing.variables,
          metadata: body.metadata ?? existing.metadata,
          status: body.status ?? existing.status,
          isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
          isDefault: body.isDefault !== undefined ? body.isDefault : existing.isDefault,
          updatedAt: new Date(),
        },
      });
      return { success: true, data: updated };
    }

    const created = await this.prisma.emailTemplate.create({
      data: {
        name: body.name || 'Welcome Template',
        category: 'WELCOME',
        type: 'EMAIL',
        subject: body.subject || '{appName} - Welcome {firstName}',
        htmlContent: body.htmlContent || body.html || '',
        textContent: body.textContent || body.text || '',
        variables: body.variables || { firstName: true, email: true, password: true, appName: true },
        metadata: body.metadata || {},
        status: body.status || 'ACTIVE',
        isActive: body.isActive !== undefined ? body.isActive : true,
        isDefault: body.isDefault || true,
        companyId: body.companyId || null,
        createdBy: body.createdBy || 1,
      },
    });

    return { success: true, data: created };
  }

  async previewEmailTemplate(id: number, sampleData?: Record<string, string>) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id, deletedAt: null },
    });

    if (!template) {
      return { success: false, message: 'Template not found' };
    }

    // Default sample data for preview
    const defaultData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'TempPass123!',
      appName: 'WeConnect CRM',
      verificationLink: 'https://app.example.com/verify?token=abc123',
      resetLink: 'https://app.example.com/reset?token=xyz789',
      ...sampleData,
    };

    // Apply variable substitution
    const renderTemplate = (content: string) => {
      return content.replace(/\{(\w+)\}/g, (_, key) => (defaultData as any)[key] ?? `{${key}}`);
    };

    const preview = {
      id: template.id,
      name: template.name,
      category: template.category,
      type: template.type,
      subject: renderTemplate(template.subject),
      htmlContent: renderTemplate(template.htmlContent),
      textContent: renderTemplate(template.textContent),
      variables: template.variables,
      sampleData: defaultData,
    };

    return { success: true, data: preview };
  }

  // Field Configuration Methods
  async getFieldConfigs(entityType: string) {
    let configs = await this.prisma.fieldConfig.findMany({
      where: { entityType, isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });

    // If no configs exist, initialize defaults
    if (configs.length === 0) {
      await this.initializeDefaultFieldConfigs();
      configs = await this.prisma.fieldConfig.findMany({
        where: { entityType, isVisible: true },
        orderBy: { displayOrder: 'asc' },
      });
    }

    return { success: true, data: configs };
  }

  async createFieldConfig(body: any) {
    const config = await this.prisma.fieldConfig.create({
      data: {
        entityType: body.entityType,
        fieldName: body.fieldName,
        label: body.label,
        isRequired: body.isRequired || false,
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
        displayOrder: body.displayOrder || 0,
        section: body.section,
        placeholder: body.placeholder,
        helpText: body.helpText,
        validation: body.validation,
        options: body.options,
      },
    });
    return { success: true, data: config };
  }

  async updateFieldConfig(id: number, body: any) {
    const config = await this.prisma.fieldConfig.update({
      where: { id },
      data: {
        label: body.label,
        isRequired: body.isRequired,
        isVisible: body.isVisible,
        displayOrder: body.displayOrder,
        section: body.section,
        placeholder: body.placeholder,
        helpText: body.helpText,
        validation: body.validation,
        options: body.options,
      },
    });
    return { success: true, data: config };
  }

  async deleteFieldConfig(id: number) {
    await this.prisma.fieldConfig.delete({
      where: { id },
    });
    return { success: true };
  }

  async initializeDefaultFieldConfigs() {
    const defaultConfigs = [
      // Personal Information
      { entityType: 'lead', fieldName: 'firstName', label: 'First Name', isRequired: true, section: 'personal', displayOrder: 1 },
      { entityType: 'lead', fieldName: 'lastName', label: 'Last Name', isRequired: true, section: 'personal', displayOrder: 2 },
      { entityType: 'lead', fieldName: 'email', label: 'Email', isRequired: true, section: 'personal', displayOrder: 3 },
      { entityType: 'lead', fieldName: 'phone', label: 'Phone', isRequired: true, section: 'personal', displayOrder: 4 },

      // Company Information
      { entityType: 'lead', fieldName: 'company', label: 'Company', isRequired: true, section: 'company', displayOrder: 5 },
      { entityType: 'lead', fieldName: 'position', label: 'Position/Job Title', isRequired: false, section: 'company', displayOrder: 6 },
      { entityType: 'lead', fieldName: 'industry', label: 'Industry', isRequired: false, section: 'company', displayOrder: 7 },
      { entityType: 'lead', fieldName: 'website', label: 'Company Website', isRequired: false, section: 'company', displayOrder: 8 },
      { entityType: 'lead', fieldName: 'companySize', label: 'Company Size', isRequired: false, section: 'company', displayOrder: 9 },
      { entityType: 'lead', fieldName: 'annualRevenue', label: 'Annual Revenue', isRequired: false, section: 'company', displayOrder: 10 },

      // Location Information
      { entityType: 'lead', fieldName: 'country', label: 'Country', isRequired: false, section: 'location', displayOrder: 11 },
      { entityType: 'lead', fieldName: 'state', label: 'State/Province', isRequired: false, section: 'location', displayOrder: 12 },
      { entityType: 'lead', fieldName: 'city', label: 'City', isRequired: false, section: 'location', displayOrder: 13 },
      { entityType: 'lead', fieldName: 'zipCode', label: 'ZIP/Postal Code', isRequired: false, section: 'location', displayOrder: 14 },
      { entityType: 'lead', fieldName: 'address', label: 'Address', isRequired: false, section: 'location', displayOrder: 15 },
      { entityType: 'lead', fieldName: 'timezone', label: 'Timezone', isRequired: false, section: 'location', displayOrder: 16 },
      { entityType: 'lead', fieldName: 'linkedinProfile', label: 'LinkedIn Profile', isRequired: false, section: 'location', displayOrder: 17 },

      // Lead Management
      { entityType: 'lead', fieldName: 'sourceId', label: 'Lead Source', isRequired: false, section: 'lead_management', displayOrder: 18 },
      { entityType: 'lead', fieldName: 'status', label: 'Status', isRequired: true, section: 'lead_management', displayOrder: 19 },
      { entityType: 'lead', fieldName: 'priority', label: 'Priority', isRequired: false, section: 'lead_management', displayOrder: 20 },
      { entityType: 'lead', fieldName: 'assignedTo', label: 'Assigned To', isRequired: false, section: 'lead_management', displayOrder: 21 },
      { entityType: 'lead', fieldName: 'budget', label: 'Expected Budget', isRequired: false, section: 'lead_management', displayOrder: 22 },
      { entityType: 'lead', fieldName: 'currency', label: 'Currency', isRequired: false, section: 'lead_management', displayOrder: 23 },
      { entityType: 'lead', fieldName: 'leadScore', label: 'Lead Score', isRequired: false, section: 'lead_management', displayOrder: 24 },
      { entityType: 'lead', fieldName: 'preferredContactMethod', label: 'Preferred Contact Method', isRequired: false, section: 'lead_management', displayOrder: 25 },
      { entityType: 'lead', fieldName: 'nextFollowUpAt', label: 'Next Follow-up Date', isRequired: false, section: 'lead_management', displayOrder: 26 },

      // Notes and Tags
      { entityType: 'lead', fieldName: 'notes', label: 'Notes', isRequired: false, section: 'notes', displayOrder: 27 },
      { entityType: 'lead', fieldName: 'tags', label: 'Tags', isRequired: false, section: 'notes', displayOrder: 28 },
    ];

    for (const config of defaultConfigs) {
      const existing = await this.prisma.fieldConfig.findUnique({
        where: { entityType_fieldName: { entityType: config.entityType, fieldName: config.fieldName } },
      });
      if (!existing) {
        await this.prisma.fieldConfig.create({ data: config });
      }
    }

    return { success: true, message: 'Default field configurations initialized' };
  }
}
