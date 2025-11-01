import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { IntegrationManager } from "../services/integrations/IntegrationManager";
import { IntegrationScheduler } from "../services/IntegrationScheduler";

// Helpers to map DB BusinessSettings -> frontend CompanySettings shape
function mapDBToCompanySettings(settings: any) {
  return {
    id: String(settings.id),
    name: settings.companyName || "",
    email: settings.companyEmail || "",
    phone: settings.companyPhone || "",
    address: settings.companyAddress || "",
    website: settings.companyWebsite || "",
    logo: settings.companyLogo || null,
    timezone: settings.timeZone || "UTC",
    fiscalYearStart: settings.fiscalYearStart || "",
    gstNumber: settings.gstNumber || "",
    panNumber: settings.panNumber || "",
    cinNumber: settings.cinNumber || "",
    industry: settings.industry || "",
    employeeCount: settings.employeeCount || "",
    description: settings.description || "",
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

export class BusinessSettingsController {
  // Get all business settings
  async getAllBusinessSettings(req: Request, res: Response) {
    try {
      // Load from DB when available
      const settings = await prisma.businessSettings.findFirst();

      const company = settings
        ? mapDBToCompanySettings(settings)
        : {
            id: "1",
            name: "WeConnect CRM",
            email: "",
            phone: "",
            address: "",
            website: "",
            logo: null,
            timezone: "UTC",
            fiscalYearStart: "04-01",
            gstNumber: "",
            panNumber: "",
            cinNumber: "",
            industry: "",
            employeeCount: "",
            description: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

      // Keep currency/tax mock for now until full DB support is added
      const businessSettings = {
        company,
        currency: {
          id: "1",
          baseCurrency: "USD",
          decimalPlaces: 2,
          symbolPosition: "before",
          thousandSeparator: ",",
          decimalSeparator: ".",
          autoUpdateRates: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tax: {
          id: "1",
          defaultTaxRate: 0,
          taxInclusive: false,
          showTaxNumber: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      res.json({
        success: true,
        data: businessSettings,
      });
    } catch (error) {
      console.error("Error fetching business settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch business settings",
      });
    }
  }

  // Company Settings
  async getCompanySettings(req: Request, res: Response) {
    try {
      const settings = await prisma.businessSettings.findFirst();

      if (!settings) {
        return res.json({
          success: true,
          data: {
            id: "1",
            name: "",
            email: "",
            phone: "",
            address: "",
            website: "",
            logo: null,
            timezone: "UTC",
            fiscalYearStart: "04-01",
            gstNumber: "",
            panNumber: "",
            cinNumber: "",
            industry: "",
            employeeCount: "",
            description: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      res.json({
        success: true,
        data: mapDBToCompanySettings(settings),
      });
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch company settings",
      });
    }
  }

  async updateCompanySettings(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        phone,
        address,
        website,
        logo,
        timezone,
        gstNumber,
        panNumber,
        cinNumber,
        fiscalYearStart,
        industry,
        employeeCount,
        description,
      } = req.body || {};

      const updateData: any = {};
      if (name !== undefined) updateData.companyName = name;
      if (email !== undefined) updateData.companyEmail = email;
      if (phone !== undefined) updateData.companyPhone = phone;
      if (address !== undefined) updateData.companyAddress = address;
      if (website !== undefined) updateData.companyWebsite = website;
      if (logo !== undefined) updateData.companyLogo = logo;
      if (timezone !== undefined) updateData.timeZone = timezone;
      if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
      if (panNumber !== undefined) updateData.panNumber = panNumber;
      if (cinNumber !== undefined) updateData.cinNumber = cinNumber;
      if (fiscalYearStart !== undefined) updateData.fiscalYearStart = fiscalYearStart;
      if (industry !== undefined) updateData.industry = industry;
      if (employeeCount !== undefined) updateData.employeeCount = employeeCount;
      if (description !== undefined) updateData.description = description;

      let settings = await prisma.businessSettings.findFirst();
      if (settings) {
        settings = await prisma.businessSettings.update({
          where: { id: settings.id },
          data: updateData,
        });
      } else {
        settings = await prisma.businessSettings.create({
          data: {
            companyName: name || "",
            ...updateData,
          },
        });
      }

      res.json({
        success: true,
        data: mapDBToCompanySettings(settings),
        message: "Company settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update company settings",
      });
    }
  }

  // Currency Settings
  async getCurrencySettings(req: Request, res: Response) {
    try {
      const currencySettings = {
        id: "1",
        baseCurrency: "USD",
        decimalPlaces: 2,
        symbolPosition: "before",
        thousandSeparator: ",",
        decimalSeparator: ".",
        autoUpdateRates: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.json({
        success: true,
        data: currencySettings,
      });
    } catch (error) {
      console.error("Error fetching currency settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch currency settings",
      });
    }
  }

  async updateCurrencySettings(req: Request, res: Response) {
    try {
      const updatedSettings = {
        id: "1",
        ...req.body,
        updatedAt: new Date(),
      };

      res.json({
        success: true,
        data: updatedSettings,
        message: "Currency settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating currency settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update currency settings",
      });
    }
  }

  // Tax Settings
  async getTaxSettings(req: Request, res: Response) {
    try {
      const taxSettings = {
        id: "1",
        defaultTaxRate: 0,
        taxInclusive: false,
        showTaxNumber: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.json({
        success: true,
        data: taxSettings,
      });
    } catch (error) {
      console.error("Error fetching tax settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tax settings",
      });
    }
  }

  async updateTaxSettings(req: Request, res: Response) {
    try {
      const updatedSettings = {
        id: "1",
        ...req.body,
        updatedAt: new Date(),
      };

      res.json({
        success: true,
        data: updatedSettings,
        message: "Tax settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating tax settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update tax settings",
      });
    }
  }

  // Lead Sources - Use existing leadSources from database
  async getLeadSources(req: Request, res: Response) {
    try {
      const leadSources = await prisma.leadSource.findMany({
        orderBy: { name: 'asc' }
      });

      // Map DB shape to UI shape expected by frontend settings module
      const mapped = leadSources.map((s: any, idx: number) => ({
        id: String(s.id ?? idx),
        name: s.name,
        description: s.description || '',
        color: '#6B7280', // default swatch for now
        isActive: s.isActive !== false,
        sortOrder: idx,
        costPerLead: undefined,
        conversionRate: undefined,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

      res.json({
        success: true,
        data: mapped,
      });
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch lead sources",
      });
    }
  }

  async createLeadSource(req: Request, res: Response) {
    try {
      // Only persist fields available in DB schema
      const { name, description, isActive } = req.body || {};
      if (!name || String(name).trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Lead source name is required' });
      }
      // Prevent duplicates by name (case-insensitive)
      const exists = await prisma.leadSource.findFirst({
        where: { name: { equals: String(name).trim(), mode: 'insensitive' } },
      });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Lead source with this name already exists' });
      }

      const created = await prisma.leadSource.create({
        data: {
          name: String(name).trim(),
          description: description ? String(description).trim() : null,
          isActive: isActive === false ? false : true,
        } as any,
      });

      // Return UI shape
      const payload = {
        id: String(created.id),
        name: created.name,
        description: created.description || '',
        color: '#6B7280',
        isActive: created.isActive !== false,
        sortOrder: 0,
        costPerLead: undefined,
        conversionRate: undefined,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };

      res.status(201).json({
        success: true,
        data: payload,
        message: "Lead source created successfully",
      });
    } catch (error) {
      console.error("Error creating lead source:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create lead source",
      });
    }
  }

  async updateLeadSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const leadSource = await prisma.leadSource.update({
        where: { id: Number(id) },
        data: req.body,
      });

      res.json({
        success: true,
        data: leadSource,
        message: "Lead source updated successfully",
      });
    } catch (error) {
      console.error("Error updating lead source:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update lead source",
      });
    }
  }

  async deleteLeadSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.leadSource.delete({
        where: { id: Number(id) },
      });

      res.json({
        success: true,
        message: "Lead source deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting lead source:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete lead source",
      });
    }
  }

  // Pipelines - Mock for now
  async getPipelines(req: Request, res: Response) {
    try {
      const pipelines = [
        {
          id: "1",
          name: "Sales Pipeline",
          description: "Standard sales process",
          isDefault: true,
          stages: [
            { id: "1", name: "Lead", order: 1, color: "#3B82F6" },
            { id: "2", name: "Qualified", order: 2, color: "#F59E0B" },
            { id: "3", name: "Proposal", order: 3, color: "#8B5CF6" },
            { id: "4", name: "Negotiation", order: 4, color: "#EF4444" },
            { id: "5", name: "Closed Won", order: 5, color: "#10B981" },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      res.json({
        success: true,
        data: pipelines,
      });
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pipelines",
      });
    }
  }

  async createPipeline(req: Request, res: Response) {
    try {
      const pipeline = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json({
        success: true,
        data: pipeline,
        message: "Pipeline created successfully",
      });
    } catch (error) {
      console.error("Error creating pipeline:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create pipeline",
      });
    }
  }

  // Placeholder methods for other endpoints
  async updatePipeline(req: Request, res: Response) {
    res.json({ success: true, message: "Pipeline updated successfully" });
  }

  async deletePipeline(req: Request, res: Response) {
    res.json({ success: true, message: "Pipeline deleted successfully" });
  }

  async getEmailTemplates(req: Request, res: Response) {
    res.json({ success: true, data: [] });
  }

  async getQuotationTemplates(req: Request, res: Response) {
    try {
      const templates = await prisma.quotationTemplate.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" }
        ],
      });

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Error fetching quotation templates:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quotation templates",
      });
    }
  }

  async createQuotationTemplate(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        headerContent,
        footerContent,
        termsAndConditions,
        validityDays,
        showTax,
        showDiscount,
        logoPosition,
        isDefault,
        isActive,
        styles,
      } = req.body;

      // If setting as default, unset other defaults
      if (isDefault) {
        await prisma.quotationTemplate.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      const template = await prisma.quotationTemplate.create({
        data: {
          name,
          description,
          headerContent,
          footerContent,
          termsAndConditions,
          validityDays: validityDays || 30,
          showTax: showTax !== undefined ? showTax : true,
          showDiscount: showDiscount !== undefined ? showDiscount : true,
          logoPosition: logoPosition || "left",
          isDefault: isDefault || false,
          isActive: isActive !== undefined ? isActive : true,
          styles: styles || {},
        },
      });

      res.status(201).json({
        success: true,
        data: template,
        message: "Quotation template created successfully",
      });
    } catch (error) {
      console.error("Error creating quotation template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create quotation template",
      });
    }
  }

  async updateQuotationTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        headerContent,
        footerContent,
        termsAndConditions,
        validityDays,
        showTax,
        showDiscount,
        logoPosition,
        isDefault,
        isActive,
        styles,
      } = req.body;

      const existingTemplate = await prisma.quotationTemplate.findFirst({
        where: {
          id: Number(id),
          deletedAt: null,
        },
      });

      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // If setting as default, unset other defaults
      if (isDefault && !existingTemplate.isDefault) {
        await prisma.quotationTemplate.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (headerContent !== undefined) updateData.headerContent = headerContent;
      if (footerContent !== undefined) updateData.footerContent = footerContent;
      if (termsAndConditions !== undefined) updateData.termsAndConditions = termsAndConditions;
      if (validityDays !== undefined) updateData.validityDays = validityDays;
      if (showTax !== undefined) updateData.showTax = showTax;
      if (showDiscount !== undefined) updateData.showDiscount = showDiscount;
      if (logoPosition !== undefined) updateData.logoPosition = logoPosition;
      if (isDefault !== undefined) updateData.isDefault = isDefault;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (styles !== undefined) updateData.styles = styles;

      const template = await prisma.quotationTemplate.update({
        where: { id: Number(id) },
        data: updateData,
      });

      res.json({
        success: true,
        data: template,
        message: "Quotation template updated successfully",
      });
    } catch (error) {
      console.error("Error updating quotation template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update quotation template",
      });
    }
  }

  async deleteQuotationTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await prisma.quotationTemplate.findFirst({
        where: {
          id: Number(id),
          deletedAt: null,
        },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      await prisma.quotationTemplate.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() },
      });

      res.json({
        success: true,
        message: "Quotation template deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting quotation template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete quotation template",
      });
    }
  }

  async setDefaultQuotationTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await prisma.quotationTemplate.findFirst({
        where: {
          id: Number(id),
          deletedAt: null,
        },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Unset all other defaults
      await prisma.quotationTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      // Set this as default
      const updatedTemplate = await prisma.quotationTemplate.update({
        where: { id: Number(id) },
        data: { isDefault: true },
      });

      res.json({
        success: true,
        data: updatedTemplate,
        message: "Default template updated successfully",
      });
    } catch (error) {
      console.error("Error setting default template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set default template",
      });
    }
  }

  async getInvoiceTemplates(req: Request, res: Response) {
    res.json({ success: true, data: [] });
  }

  async getProposalTemplates(req: Request, res: Response) {
    try {
      const templates = await prisma.proposalTemplate.findMany({
        where: {
          deletedAt: null,
          isActive: true,
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" }
        ],
      });

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Error fetching proposal templates:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch proposal templates",
      });
    }
  }

  async getNotificationSettings(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      }
    });
  }

  async getAutomationRules(req: Request, res: Response) {
    res.json({ success: true, data: [] });
  }

  async getIntegrationSettings(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        emailIntegration: null,
        calendarIntegration: null,
        paymentGateway: null,
      }
    });
  }

  async getPaymentGatewaySettings(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        stripe: { enabled: false },
        paypal: { enabled: false },
      }
    });
  }

  // Integration Settings Methods
  async getBusinessSettingsFromDB(req: Request, res: Response) {
    try {
      const settings = await prisma.businessSettings.findFirst();
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "Business settings not found",
        });
      }

      // Don't expose sensitive information like API secrets
      const sanitizedSettings = {
        ...settings,
        metaAdsApiSecret: settings.metaAdsApiSecret ? "••••••••" : null,
        indiamartApiSecret: settings.indiamartApiSecret ? "••••••••" : null,
        tradindiaApiSecret: settings.tradindiaApiSecret ? "••••••••" : null,
      };

      res.json({
        success: true,
        data: { settings: sanitizedSettings },
      });
    } catch (error) {
      console.error("Get business settings error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async updateBusinessSettingsInDB(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const {
        companyName,
        companyEmail,
        companyPhone,
        companyAddress,
        companyWebsite,
        companyLogo,
        timeZone,
        dateFormat,
        currency,
        passwordMinLength,
        passwordRequireUpper,
        passwordRequireLower,
        passwordRequireNumber,
        passwordRequireSymbol,
        sessionTimeout,
        maxLoginAttempts,
        accountLockDuration,
        twoFactorRequired,
        emailVerificationRequired,
        leadAutoAssignmentEnabled,
        leadFollowUpReminderDays,
        // Integration settings
        metaAdsApiKey,
        metaAdsApiSecret,
        metaAdsEnabled,
        indiamartApiKey,
        indiamartApiSecret,
        indiamartEnabled,
        tradindiaApiKey,
        tradindiaApiSecret,
        tradindiaEnabled,
      } = req.body;

      let settings = await prisma.businessSettings.findFirst();
      
      const updateData: any = {};

      // Only update fields that are provided
      if (companyName !== undefined) updateData.companyName = companyName;
      if (companyEmail !== undefined) updateData.companyEmail = companyEmail;
      if (companyPhone !== undefined) updateData.companyPhone = companyPhone;
      if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
      if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
      if (companyLogo !== undefined) updateData.companyLogo = companyLogo;
      if (timeZone !== undefined) updateData.timeZone = timeZone;
      if (dateFormat !== undefined) updateData.dateFormat = dateFormat;
      if (currency !== undefined) updateData.currency = currency;
      if (passwordMinLength !== undefined) updateData.passwordMinLength = passwordMinLength;
      if (passwordRequireUpper !== undefined) updateData.passwordRequireUpper = passwordRequireUpper;
      if (passwordRequireLower !== undefined) updateData.passwordRequireLower = passwordRequireLower;
      if (passwordRequireNumber !== undefined) updateData.passwordRequireNumber = passwordRequireNumber;
      if (passwordRequireSymbol !== undefined) updateData.passwordRequireSymbol = passwordRequireSymbol;
      if (sessionTimeout !== undefined) updateData.sessionTimeout = sessionTimeout;
      if (maxLoginAttempts !== undefined) updateData.maxLoginAttempts = maxLoginAttempts;
      if (accountLockDuration !== undefined) updateData.accountLockDuration = accountLockDuration;
      if (twoFactorRequired !== undefined) updateData.twoFactorRequired = twoFactorRequired;
      if (emailVerificationRequired !== undefined) updateData.emailVerificationRequired = emailVerificationRequired;
      if (leadAutoAssignmentEnabled !== undefined) updateData.leadAutoAssignmentEnabled = leadAutoAssignmentEnabled;
      if (leadFollowUpReminderDays !== undefined) updateData.leadFollowUpReminderDays = leadFollowUpReminderDays;

      // Integration settings
      if (metaAdsApiKey !== undefined) updateData.metaAdsApiKey = metaAdsApiKey;
      if (metaAdsApiSecret !== undefined) updateData.metaAdsApiSecret = metaAdsApiSecret;
      if (metaAdsEnabled !== undefined) updateData.metaAdsEnabled = metaAdsEnabled;
      if (indiamartApiKey !== undefined) updateData.indiamartApiKey = indiamartApiKey;
      if (indiamartApiSecret !== undefined) updateData.indiamartApiSecret = indiamartApiSecret;
      if (indiamartEnabled !== undefined) updateData.indiamartEnabled = indiamartEnabled;
      if (tradindiaApiKey !== undefined) updateData.tradindiaApiKey = tradindiaApiKey;
      if (tradindiaApiSecret !== undefined) updateData.tradindiaApiSecret = tradindiaApiSecret;
      if (tradindiaEnabled !== undefined) updateData.tradindiaEnabled = tradindiaEnabled;

      if (settings) {
        settings = await prisma.businessSettings.update({
          where: { id: settings.id },
          data: updateData,
        });
      } else {
        settings = await prisma.businessSettings.create({
          data: {
            companyName: companyName || "WeConnect CRM",
            ...updateData,
          },
        });
      }

      // Sanitize response
      const sanitizedSettings = {
        ...settings,
        metaAdsApiSecret: settings.metaAdsApiSecret ? "••••••••" : null,
        indiamartApiSecret: settings.indiamartApiSecret ? "••••••••" : null,
        tradindiaApiSecret: settings.tradindiaApiSecret ? "••••••••" : null,
      };

      res.json({
        success: true,
        message: "Business settings updated successfully",
        data: { settings: sanitizedSettings },
      });
    } catch (error) {
      console.error("Update business settings error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getIntegrationStatus(req: Request, res: Response) {
    try {
      const settings = await prisma.businessSettings.findFirst();
      
      if (!settings) {
        return res.json({
          success: true,
          data: {
            integrations: {
              metaAds: { enabled: false, configured: false },
              indiamart: { enabled: false, configured: false },
              tradeindia: { enabled: false, configured: false },
            },
          },
        });
      }

      const integrations = {
        metaAds: {
          enabled: settings.metaAdsEnabled,
          configured: !!(settings.metaAdsApiKey && settings.metaAdsApiSecret),
        },
        indiamart: {
          enabled: settings.indiamartEnabled,
          configured: !!settings.indiamartApiKey,
        },
        tradeindia: {
          enabled: settings.tradindiaEnabled,
          configured: !!(settings.tradindiaApiKey && settings.tradindiaApiSecret),
        },
      };

      res.json({
        success: true,
        data: { integrations },
      });
    } catch (error) {
      console.error("Get integration status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async testIntegrationConnection(req: Request, res: Response) {
    try {
      const { integrationName } = req.params;
      
      const integrationManager = new IntegrationManager(prisma);
      await integrationManager.initializeIntegrations();
      
      const result = await integrationManager.testIntegration(integrationName);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Integration test failed',
        });
      }
      
      res.json({
        success: true,
        message: `${integrationName} connection test successful`,
      });
    } catch (error) {
      console.error('Test integration connection error:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing integration connection',
      });
    }
  }

  async getAvailableIntegrations(req: Request, res: Response) {
    try {
      const availableIntegrations = [
        {
          name: 'meta-ads',
          displayName: 'Meta Ads (Facebook)',
          description: 'Fetch leads from Facebook Lead Ads campaigns',
          fields: [
            { name: 'apiKey', label: 'Access Token', type: 'text', required: true },
            { name: 'apiSecret', label: 'App Secret', type: 'password', required: false },
          ],
          instructions: 'To get your Meta Ads API credentials:\n1. Go to Facebook Developers (developers.facebook.com)\n2. Create or select your app\n3. Add the Marketing API product\n4. Get your Access Token from the Tools section',
        },
        {
          name: 'indiamart',
          displayName: 'IndiaMart',
          description: 'Fetch leads from IndiaMart inquiries',
          fields: [
            { name: 'apiKey', label: 'CRM Key', type: 'text', required: true },
          ],
          instructions: 'To get your IndiaMart CRM Key:\n1. Login to your IndiaMart account\n2. Go to My IndiaMart > Manage BL\n3. Click on CRM Integration\n4. Copy your unique CRM Key',
        },
        {
          name: 'tradeindia',
          displayName: 'TradeIndia',
          description: 'Fetch leads from TradeIndia buyer inquiries',
          fields: [
            { name: 'apiKey', label: 'API Key', type: 'text', required: true },
            { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
          ],
          instructions: 'To get your TradeIndia API credentials:\n1. Login to your TradeIndia account\n2. Go to My Account > API Integration\n3. Generate or copy your API Key and Secret',
        },
      ];

      res.json({
        success: true,
        data: { integrations: availableIntegrations },
      });
    } catch (error) {
      console.error('Get available integrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available integrations',
      });
    }
  }

  async syncAllIntegrations(req: Request, res: Response) {
    try {
      const integrationScheduler = new IntegrationScheduler(prisma);
      await integrationScheduler.initialize();
      
      const results = await integrationScheduler.syncAllIntegrationsNow();
      
      res.json({
        success: results.success,
        message: results.success ? 'All integrations synced successfully' : 'Some integrations failed to sync',
        data: results,
      });
    } catch (error) {
      console.error('Manual sync all integrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error syncing integrations',
      });
    }
  }

  async syncSpecificIntegration(req: Request, res: Response) {
    try {
      const { integrationName } = req.params;
      
      const integrationScheduler = new IntegrationScheduler(prisma);
      await integrationScheduler.initialize();
      
      const result = await integrationScheduler.syncSpecificIntegrationNow(integrationName);
      
      if (result.success) {
        res.json({
          success: true,
          message: `${integrationName} synced successfully. ${result.count || 0} leads fetched.`,
          data: result,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || `Failed to sync ${integrationName}`,
        });
      }
    } catch (error) {
      console.error('Manual sync specific integration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error syncing integration',
      });
    }
  }
}

export const businessSettingsController = new BusinessSettingsController();
