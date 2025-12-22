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

@UseGuards(AuthGuard('jwt'))
@Controller('business-settings')
export class BusinessSettingsController {
  constructor(private readonly service: BusinessSettingsService) { }

  @Get('company')
  getCompany() {
    return this.service.getCompany();
  }
  @Put('company')
  updateCompany(@Body() body: any) {
    return this.service.updateCompany(body);
  }

  @Post('company/logo')
  @UseInterceptors(FileInterceptor('logo'))
  uploadLogo(@UploadedFile() file: any) {
    return this.service.uploadLogo(file);
  }

  @Get('currency')
  getCurrency() {
    return this.service.getCurrency();
  }
  @Put('currency')
  updateCurrency(@Body() body: any) {
    return this.service.updateCurrency(body);
  }

  @Get('tax')
  getTax() {
    return this.service.getTax();
  }
  @Put('tax')
  updateTax(@Body() body: any) {
    return this.service.updateTax(body);
  }

  @Get('all')
  getAll() {
    return this.service.getAllBusinessSettings();
  }

  @Get('numbering')
  getNumbering() {
    return this.service.getNumbering();
  }

  @Put('numbering')
  updateNumbering(@Body() body: any) {
    return this.service.updateNumbering(body);
  }


  @Get('deal-statuses')
  listDealStatuses() {
    return this.service.listDealStatuses();
  }

  @Post('deal-statuses')
  createDealStatus(@Body() body: any) {
    return this.service.createDealStatus(body);
  }

  @Put('deal-statuses/:id')
  updateDealStatus(@Param('id') id: string, @Body() body: any) {
    return this.service.updateDealStatus(Number(id), body);
  }

  @Delete('deal-statuses/:id')
  deleteDealStatus(@Param('id') id: string) {
    return this.service.deleteDealStatus(Number(id));
  }

  @Get('integrations/available')
  getAvailableIntegrations() {
    return this.service.getAvailableIntegrations();
  }

  @Get('integrations/status')
  getIntegrationsStatus() {
    return this.service.getIntegrationsStatus();
  }

  @Get('settings')
  getSettings() {
    return this.service.getIntegrationSettings();
  }

  @Put('settings')
  updateSettings(@Body() body: any) {
    return this.service.updateIntegrationSettings(body);
  }

  @Post('integrations/:name/test')
  testIntegration(@Param('name') name: string) {
    return this.service.testIntegration(name);
  }

  @Post('integrations/:name/sync')
  syncIntegration(@Param('name') name: string) {
    return this.service.syncIntegration(name);
  }

  // Lead Sources wrapper routes for business-settings path compatibility
  @Get('lead-sources') listLeadSources() {
    return this.service.listLeadSources();
  }
  @Post('lead-sources') createLeadSource(@Body() body: any) {
    return this.service.createLeadSource(body);
  }
  @Put('lead-sources/:id') updateLeadSource(@Body() body: any) {
    return this.service.updateLeadSource(body);
  }

  // Quotation Templates endpoints
  @Get('quotation-templates')
  listQuotationTemplates() {
    return this.service.listQuotationTemplates();
  }

  @Post('quotation-templates')
  createQuotationTemplate(@Body() body: any) {
    return this.service.createQuotationTemplate(body);
  }

  @Put('quotation-templates/:id')
  updateQuotationTemplate(@Param('id') id: string, @Body() body: any) {
    return this.service.updateQuotationTemplate(Number(id), body);
  }

  @Delete('quotation-templates/:id')
  deleteQuotationTemplate(@Param('id') id: string) {
    return this.service.deleteQuotationTemplate(Number(id));
  }

  @Put('quotation-templates/:id/set-default')
  setDefaultQuotationTemplate(@Param('id') id: string) {
    return this.service.setDefaultQuotationTemplate(Number(id));
  }

  // Terms and Conditions endpoints
  @Get('terms-and-conditions')
  listTermsAndConditions() {
    return this.service.listTermsAndConditions();
  }

  @Post('terms-and-conditions')
  createTermsAndConditions(@Body() body: any) {
    return this.service.createTermsAndConditions(body);
  }

  @Put('terms-and-conditions/:id')
  updateTermsAndConditions(@Param('id') id: string, @Body() body: any) {
    return this.service.updateTermsAndConditions(Number(id), body);
  }

  @Delete('terms-and-conditions/:id')
  deleteTermsAndConditions(@Param('id') id: string) {
    return this.service.deleteTermsAndConditions(Number(id));
  }

  @Put('terms-and-conditions/:id/set-default')
  setDefaultTermsAndConditions(@Param('id') id: string) {
    return this.service.setDefaultTermsAndConditions(Number(id));
  }

  // Email Template endpoints - Specific routes BEFORE parameterized routes
  @Get('email-templates/welcome')
  getWelcomeEmailTemplate() {
    return this.service.getWelcomeEmailTemplate();
  }

  @Put('email-templates/welcome')
  updateWelcomeEmailTemplate(@Body() body: any) {
    return this.service.upsertWelcomeEmailTemplate(body);
  }

  @Get('email-templates/category/:category')
  getEmailTemplatesByCategory(@Param('category') category: string) {
    return this.service.getEmailTemplatesByCategory(category as any);
  }

  @Get('email-templates/system/:category')
  getSystemEmailTemplate(@Param('category') category: string) {
    return this.service.getSystemEmailTemplate(category as any);
  }

  @Get('email-templates/preview/:id')
  previewEmailTemplate(@Param('id') id: string, @Query() query: any) {
    return this.service.previewEmailTemplate(Number(id), query);
  }

  @Get('email-templates')
  getEmailTemplates() {
    return this.service.getEmailTemplates();
  }

  @Post('email-templates')
  createEmailTemplate(@Body() body: any) {
    return this.service.createEmailTemplate(body);
  }

  @Put('email-templates/:id/set-default')
  setDefaultEmailTemplate(@Param('id') id: string, @Body() body: any) {
    return this.service.setDefaultEmailTemplate(Number(id), body.category);
  }

  @Put('email-templates/:id')
  updateEmailTemplate(@Param('id') id: string, @Body() body: any) {
    return this.service.updateEmailTemplate(Number(id), body);
  }

  @Delete('email-templates/:id')
  deleteEmailTemplate(@Param('id') id: string) {
    return this.service.deleteEmailTemplate(Number(id));
  }

  // Field Configuration endpoints
  @Get('field-configs/:entityType')
  getFieldConfigs(@Param('entityType') entityType: string) {
    return this.service.getFieldConfigs(entityType);
  }

  @Post('field-configs')
  createFieldConfig(@Body() body: any) {
    return this.service.createFieldConfig(body);
  }

  @Put('field-configs/:id')
  updateFieldConfig(@Param('id') id: string, @Body() body: any) {
    return this.service.updateFieldConfig(Number(id), body);
  }

  @Delete('field-configs/:id')
  deleteFieldConfig(@Param('id') id: string) {
    return this.service.deleteFieldConfig(Number(id));
  }

  @Post('field-configs/initialize')
  initializeDefaultFieldConfigs() {
    return this.service.initializeDefaultFieldConfigs();
  }

  // Dashboard Settings endpoints
  @Get('dashboard')
  getDashboardSettings() {
    return this.service.getDashboardSettings();
  }

  @Put('dashboard')
  updateDashboardSettings(@Body() body: any) {
    return this.service.updateDashboardSettings(body);
  }

}
