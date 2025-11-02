import {
  Body,
  Controller,
  Get,
  Post,
  Put,
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
  constructor(private readonly service: BusinessSettingsService) {}

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

  @Get('pipelines')
  getPipelines() {
    return this.service.getPipelines();
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
}
