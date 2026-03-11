import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessSettingsService } from './business-settings.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('business-settings')
export class BusinessSettingsController {
  constructor(private readonly service: BusinessSettingsService) {}

  @Get('company')
  @RequirePermission('business_settings_company.read')
  getCompany() {
    return this.service.getCompany();
  }
  @Put('company')
  @RequirePermission('business_settings_company.update')
  updateCompany(@Body() body: any) {
    return this.service.updateCompany(body);
  }

  @Post('company/logo')
  @UseInterceptors(FileInterceptor('logo'))
  @RequirePermission('business_settings_company.update')
  uploadLogo(@UploadedFile() file: any) {
    return this.service.uploadLogo(file);
  }

  @Get('currency')
  @RequirePermission('business_settings_currency.read')
  getCurrency() {
    return this.service.getCurrency();
  }
  @Put('currency')
  @RequirePermission('business_settings_currency.update')
  updateCurrency(@Body() body: any) {
    return this.service.updateCurrency(body);
  }

  @Get('tax')
  @RequirePermission('business_settings_tax.read')
  getTax() {
    return this.service.getTax();
  }
  @Put('tax')
  @RequirePermission('business_settings_tax.update')
  updateTax(@Body() body: any) {
    return this.service.updateTax(body);
  }

  @Get('all')
  @RequirePermission('business_settings.read')
  getAll() {
    return this.service.getAllBusinessSettings();
  }

  @Get('numbering')
  @RequirePermission('business_settings_numbering.read')
  getNumbering() {
    return this.service.getNumbering();
  }

  @Put('numbering')
  @RequirePermission('business_settings_numbering.update')
  updateNumbering(@Body() body: any) {
    return this.service.updateNumbering(body);
  }

  @Get('deal-statuses')
  @RequirePermission('business_settings_deal_status.read')
  listDealStatuses() {
    return this.service.listDealStatuses();
  }

  @Post('deal-statuses')
  @RequirePermission('business_settings_deal_status.create')
  createDealStatus(@Body() body: any) {
    return this.service.createDealStatus(body);
  }

  @Put('deal-statuses/:id')
  @RequirePermission('business_settings_deal_status.update')
  updateDealStatus(@Param('id') id: string, @Body() body: any) {
    return this.service.updateDealStatus(Number(id), body);
  }

  @Delete('deal-statuses/:id')
  @RequirePermission('business_settings_deal_status.delete')
  deleteDealStatus(@Param('id') id: string) {
    return this.service.deleteDealStatus(Number(id));
  }

  @Get('lead-statuses')
  @RequirePermission('business_settings_deal_status.read')
  listLeadStatuses() {
    return this.service.listLeadStatuses();
  }

  @Post('lead-statuses')
  @RequirePermission('business_settings_deal_status.create')
  createLeadStatus(@Body() body: any) {
    return this.service.createLeadStatus(body);
  }

  @Put('lead-statuses/:id')
  @RequirePermission('business_settings_deal_status.update')
  updateLeadStatus(@Param('id') id: string, @Body() body: any) {
    return this.service.updateLeadStatus(Number(id), body);
  }

  @Delete('lead-statuses/:id')
  @RequirePermission('business_settings_deal_status.delete')
  deleteLeadStatus(@Param('id') id: string) {
    return this.service.deleteLeadStatus(Number(id));
  }

  @Get('integrations/available')
  @RequirePermission('business_settings_integrations.read')
  getAvailableIntegrations() {
    return this.service.getAvailableIntegrations();
  }

  @Get('integrations/status')
  @RequirePermission('business_settings_integrations.read')
  getIntegrationsStatus() {
    return this.service.getIntegrationsStatus();
  }

  @Get('settings')
  @RequirePermission('business_settings_integrations.read')
  getSettings() {
    return this.service.getIntegrationSettings();
  }

  @Put('settings')
  @RequirePermission('business_settings_integrations.update')
  updateSettings(@Body() body: any) {
    return this.service.updateIntegrationSettings(body);
  }

  @Post('integrations/:name/test')
  @RequirePermission('business_settings_integrations.update')
  testIntegration(@Param('name') name: string) {
    return this.service.testIntegration(name);
  }

  @Post('integrations/:name/sync')
  @RequirePermission('business_settings_integrations.sync')
  syncIntegration(@Param('name') name: string) {
    return this.service.syncIntegration(name);
  }

  // Lead Sources wrapper routes for business-settings path compatibility
  @Get('lead-sources')
  @RequirePermission('business_settings_lead_source.read')
  listLeadSources() {
    return this.service.listLeadSources();
  }
  @Post('lead-sources')
  @RequirePermission('business_settings_lead_source.create')
  createLeadSource(@Body() body: any) {
    return this.service.createLeadSource(body);
  }
  @Put('lead-sources/:id')
  @RequirePermission('business_settings_lead_source.update')
  updateLeadSource(@Body() body: any) {
    return this.service.updateLeadSource(body);
  }

  // Quotation Templates endpoints
  @Get('quotation-templates')
  @RequirePermission('business_settings_quotation_template.read')
  listQuotationTemplates() {
    return this.service.listQuotationTemplates();
  }

  @Post('quotation-templates')
  @RequirePermission('business_settings_quotation_template.create')
  createQuotationTemplate(@Body() body: any) {
    return this.service.createQuotationTemplate(body);
  }

  @Put('quotation-templates/:id')
  @RequirePermission('business_settings_quotation_template.update')
  updateQuotationTemplate(@Param('id') id: string, @Body() body: any) {
    return this.service.updateQuotationTemplate(Number(id), body);
  }

  @Delete('quotation-templates/:id')
  @RequirePermission('business_settings_quotation_template.delete')
  deleteQuotationTemplate(@Param('id') id: string) {
    return this.service.deleteQuotationTemplate(Number(id));
  }

  @Put('quotation-templates/:id/set-default')
  @RequirePermission('business_settings_quotation_template.update')
  setDefaultQuotationTemplate(@Param('id') id: string) {
    return this.service.setDefaultQuotationTemplate(Number(id));
  }

  // Terms and Conditions endpoints
  @Get('terms-and-conditions')
  @RequirePermission('business_settings_terms_conditions.read')
  listTermsAndConditions() {
    return this.service.listTermsAndConditions();
  }

  @Post('terms-and-conditions')
  @RequirePermission('business_settings_terms_conditions.create')
  createTermsAndConditions(@Body() body: any) {
    return this.service.createTermsAndConditions(body);
  }

  @Put('terms-and-conditions/:id')
  @RequirePermission('business_settings_terms_conditions.update')
  updateTermsAndConditions(@Param('id') id: string, @Body() body: any) {
    return this.service.updateTermsAndConditions(Number(id), body);
  }

  @Delete('terms-and-conditions/:id')
  @RequirePermission('business_settings_terms_conditions.delete')
  deleteTermsAndConditions(@Param('id') id: string) {
    return this.service.deleteTermsAndConditions(Number(id));
  }

  @Put('terms-and-conditions/:id/set-default')
  @RequirePermission('business_settings_terms_conditions.update')
  setDefaultTermsAndConditions(@Param('id') id: string) {
    return this.service.setDefaultTermsAndConditions(Number(id));
  }

  // Email Template endpoints - Specific routes BEFORE parameterized routes
  @Get('email-templates/welcome')
  @RequirePermission('business_settings_email_template.read')
  getWelcomeEmailTemplate() {
    return this.service.getWelcomeEmailTemplate();
  }

  @Put('email-templates/welcome')
  @RequirePermission('business_settings_email_template.update')
  updateWelcomeEmailTemplate(@Body() body: any) {
    return this.service.upsertWelcomeEmailTemplate(body);
  }

  @Get('email-templates/category/:category')
  @RequirePermission('business_settings_email_template.read')
  getEmailTemplatesByCategory(@Param('category') category: string) {
    return this.service.getEmailTemplatesByCategory(category as any);
  }

  @Get('email-templates/system/:category')
  @RequirePermission('business_settings_email_template.read')
  getSystemEmailTemplate(@Param('category') category: string) {
    return this.service.getSystemEmailTemplate(category as any);
  }

  @Get('email-templates/preview/:id')
  @RequirePermission('business_settings_email_template.read')
  previewEmailTemplate(@Param('id') id: string, @Query() query: any) {
    return this.service.previewEmailTemplate(Number(id), query);
  }

  @Get('email-templates')
  @RequirePermission('business_settings_email_template.read')
  getEmailTemplates() {
    return this.service.getEmailTemplates();
  }

  @Post('email-templates')
  @RequirePermission('business_settings_email_template.create')
  createEmailTemplate(@Body() body: any) {
    return this.service.createEmailTemplate(body);
  }

  @Put('email-templates/:id/set-default')
  @RequirePermission('business_settings_email_template.update')
  setDefaultEmailTemplate(@Param('id') id: string, @Body() body: any) {
    return this.service.setDefaultEmailTemplate(Number(id), body.category);
  }

  @Put('email-templates/:id')
  @RequirePermission('business_settings_email_template.update')
  updateEmailTemplate(@Param('id') id: string, @Body() body: any) {
    return this.service.updateEmailTemplate(Number(id), body);
  }

  @Delete('email-templates/:id')
  @RequirePermission('business_settings_email_template.delete')
  deleteEmailTemplate(@Param('id') id: string) {
    return this.service.deleteEmailTemplate(Number(id));
  }

  // Field Configuration endpoints
  @Get('field-configs/:entityType')
  getFieldConfigs(@Param('entityType') entityType: string) {
    return this.service.getFieldConfigs(entityType);
  }

  @Post('field-configs')
  @RequirePermission('business_settings_field_config.create')
  createFieldConfig(@Body() body: any) {
    return this.service.createFieldConfig(body);
  }

  @Put('field-configs/:id')
  @RequirePermission('business_settings_field_config.update')
  updateFieldConfig(@Param('id') id: string, @Body() body: any) {
    return this.service.updateFieldConfig(Number(id), body);
  }

  @Delete('field-configs/:id')
  @RequirePermission('business_settings_field_config.delete')
  deleteFieldConfig(@Param('id') id: string) {
    return this.service.deleteFieldConfig(Number(id));
  }

  @Post('field-configs/initialize')
  @RequirePermission('business_settings_field_config.update')
  initializeDefaultFieldConfigs() {
    return this.service.initializeDefaultFieldConfigs();
  }

  // Dashboard Settings endpoints
  @Get('dashboard')
  @RequirePermission('business_settings_dashboard.read')
  getDashboardSettings() {
    return this.service.getDashboardSettings();
  }

  @Put('dashboard')
  @RequirePermission('business_settings_dashboard.update')
  updateDashboardSettings(@Body() body: any) {
    return this.service.updateDashboardSettings(body);
  }

  // Lead Section endpoints
  @Get('lead-sections')
  @RequirePermission('business_settings_field_config.read')
  listLeadSections() {
    return this.service.listLeadSections();
  }

  @Post('lead-sections')
  @RequirePermission('business_settings_field_config.create')
  createLeadSection(@Body() body: any) {
    return this.service.createLeadSection(body);
  }

  @Put('lead-sections/:id')
  @RequirePermission('business_settings_field_config.update')
  updateLeadSection(@Param('id') id: string, @Body() body: any) {
    return this.service.updateLeadSection(Number(id), body);
  }

  @Delete('lead-sections/:id')
  @RequirePermission('business_settings_field_config.delete')
  deleteLeadSection(@Param('id') id: string) {
    return this.service.deleteLeadSection(Number(id));
  }
}
