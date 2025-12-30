"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const database_config_1 = __importDefault(require("./config/database.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const app_config_1 = __importDefault(require("./config/app.config"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const leads_module_1 = require("./modules/leads/leads.module");
const companies_module_1 = require("./modules/companies/companies.module");
const deals_module_1 = require("./modules/deals/deals.module");
const lead_sources_module_1 = require("./modules/lead-sources/lead-sources.module");
const tags_module_1 = require("./modules/tags/tags.module");
const roles_module_1 = require("./modules/roles/roles.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const industries_module_1 = require("./modules/industries/industries.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const business_settings_module_1 = require("./modules/business-settings/business-settings.module");
const products_module_1 = require("./modules/products/products.module");
const quotations_module_1 = require("./modules/quotations/quotations.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const activities_module_1 = require("./modules/activities/activities.module");
const communications_module_1 = require("./modules/communications/communications.module");
const call_logs_module_1 = require("./modules/call-logs/call-logs.module");
const files_module_1 = require("./modules/files/files.module");
const proposal_templates_module_1 = require("./modules/proposal-templates/proposal-templates.module");
const integrations_module_1 = require("./modules/integrations/integrations.module");
const bulk_import_module_1 = require("./modules/bulk-import/bulk-import.module");
const notes_module_1 = require("./modules/notes/notes.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const automation_module_1 = require("./modules/automation/automation.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const core_1 = require("@nestjs/core");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const teams_module_1 = require("./modules/teams/teams.module");
const taxes_module_1 = require("./modules/taxes/taxes.module");
const currencies_module_1 = require("./modules/currencies/currencies.module");
const payments_module_1 = require("./modules/payments/payments.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, jwt_config_1.default, app_config_1.default],
            }),
            schedule_1.ScheduleModule.forRoot(),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            leads_module_1.LeadsModule,
            companies_module_1.CompaniesModule,
            deals_module_1.DealsModule,
            lead_sources_module_1.LeadSourcesModule,
            tags_module_1.TagsModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            industries_module_1.IndustriesModule,
            analytics_module_1.AnalyticsModule,
            business_settings_module_1.BusinessSettingsModule,
            products_module_1.ProductsModule,
            quotations_module_1.QuotationsModule,
            invoices_module_1.InvoicesModule,
            tasks_module_1.TasksModule,
            activities_module_1.ActivitiesModule,
            communications_module_1.CommunicationsModule,
            call_logs_module_1.CallLogsModule,
            files_module_1.FilesModule,
            proposal_templates_module_1.ProposalTemplatesModule,
            integrations_module_1.IntegrationsModule,
            bulk_import_module_1.BulkImportModule,
            notes_module_1.NotesModule,
            expenses_module_1.ExpensesModule,
            automation_module_1.AutomationModule,
            notifications_module_1.NotificationsModule,
            teams_module_1.TeamsModule,
            taxes_module_1.TaxesModule,
            currencies_module_1.CurrenciesModule,
            payments_module_1.PaymentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map