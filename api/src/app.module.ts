import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LeadsModule } from './modules/leads/leads.module';
// import { ContactsModule } from './modules/contacts/contacts.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DealsModule } from './modules/deals/deals.module';
import { LeadSourcesModule } from './modules/lead-sources/lead-sources.module';
import { TagsModule } from './modules/tags/tags.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { IndustriesModule } from './modules/industries/industries.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BusinessSettingsModule } from './modules/business-settings/business-settings.module';
import { ProductsModule } from './modules/products/products.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { CallLogsModule } from './modules/call-logs/call-logs.module';
import { FilesModule } from './modules/files/files.module';
import { ProposalTemplatesModule } from './modules/proposal-templates/proposal-templates.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { BulkImportModule } from './modules/bulk-import/bulk-import.module';
import { NotesModule } from './modules/notes/notes.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AutomationModule } from './modules/automation/automation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TeamsModule } from './modules/teams/teams.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),
    // Schedule module for cron jobs (task/follow-up reminders)
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    // ContactsModule,
    CompaniesModule,
    DealsModule,
    LeadSourcesModule,
    TagsModule,
    RolesModule,
    PermissionsModule,
    IndustriesModule,
    AnalyticsModule,
    BusinessSettingsModule,
    ProductsModule,
    QuotationsModule,
    InvoicesModule,
    TasksModule,
    ActivitiesModule,
    CommunicationsModule,
    CallLogsModule,
    FilesModule,
    ProposalTemplatesModule,
    IntegrationsModule,
    BulkImportModule,
    NotesModule,
    ExpensesModule,
    AutomationModule,
    NotificationsModule,
    TeamsModule,
    TaxesModule,
    CurrenciesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule { }
