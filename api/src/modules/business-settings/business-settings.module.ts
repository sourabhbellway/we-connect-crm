import { Module } from '@nestjs/common';
import { BusinessSettingsService } from './business-settings.service';
import { BusinessSettingsController } from './business-settings.controller';
import { InvoiceTemplatesService } from './invoice-templates.service';
import { InvoiceTemplatesController } from './invoice-templates.controller';
import { PrismaService } from '../../database/prisma.service';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';
import { UnitTypesModule } from '../unit-types/unit-types.module';
import { CommunicationsModule } from '../communications/communications.module';

@Module({
  imports: [ProductCategoriesModule, UnitTypesModule, CommunicationsModule],
  controllers: [BusinessSettingsController, InvoiceTemplatesController],
  providers: [BusinessSettingsService, InvoiceTemplatesService, PrismaService],
  exports: [BusinessSettingsService, InvoiceTemplatesService],
})
export class BusinessSettingsModule { }
