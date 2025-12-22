"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const analytics_service_1 = require("./analytics.service");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let AnalyticsController = class AnalyticsController {
    service;
    constructor(service) {
        this.service = service;
    }
    kpis(startDate, endDate, userId, scope, user) {
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.kpis(startDate, endDate, parsedUserId, includeTeamData, user);
    }
    getLeadStatusDistribution(userId, scope, user) {
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getLeadStatusDistribution(parsedUserId, includeTeamData, user);
    }
    getRevenueTrends(months, userId, scope, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 12;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getRevenueTrends(parsedMonths, parsedUserId, includeTeamData, user);
    }
    getActivityTrends(months, userId, scope, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 12;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getActivityTrends(parsedMonths, parsedUserId, includeTeamData, user);
    }
    getUserGrowth(months) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 12;
        return this.service.getUserGrowth(parsedMonths);
    }
    getLeadConversionFunnel(userId, scope, user) {
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getLeadConversionFunnel(parsedUserId, includeTeamData, user);
    }
    getSalesPipelineFlow(months, userId, scope, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getSalesPipelineFlow(parsedMonths, parsedUserId, includeTeamData, user);
    }
    getTopPerformers(limit, userId, scope, user) {
        const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 5;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getTopPerformers(parsedLimit, parsedUserId, includeTeamData, user);
    }
    getDealVelocity(months, userId, scope, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getDealVelocity(parsedMonths, parsedUserId, includeTeamData, user);
    }
    getLeadSourceDistribution(userId, scope, user) {
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const includeTeamData = scope === 'all';
        return this.service.getLeadSourceDistribution(parsedUserId, includeTeamData, user);
    }
    getTaskReport(months, userId, scope, page, limit, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
        const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
        return this.service.getTaskReport(parsedMonths, parsedUserId, scope, user, parsedPage, parsedLimit);
    }
    getLeadReport(months, userId, scope, page, limit, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
        const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
        return this.service.getLeadReport(parsedMonths, parsedUserId, scope, user, parsedPage, parsedLimit);
    }
    getDealReport(months, userId, scope, page, limit, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
        const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
        return this.service.getDealReport(parsedMonths, parsedUserId, scope, user, parsedPage, parsedLimit);
    }
    getExpenseReport(months, userId, scope, page, limit, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
        const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
        return this.service.getExpenseReport(parsedMonths, parsedUserId, scope, user, parsedPage, parsedLimit);
    }
    getInvoiceReport(months, userId, scope, page, limit, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
        const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
        return this.service.getInvoiceReport(parsedMonths, parsedUserId, scope, user, parsedPage, parsedLimit);
    }
    getQuotationReport(months, userId, scope, page, limit, user) {
        const parsedMonths = months && !isNaN(Number(months)) ? Number(months) : 6;
        const parsedUserId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
        const parsedPage = page && !isNaN(Number(page)) ? Number(page) : 1;
        const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
        return this.service.getQuotationReport(parsedMonths, parsedUserId, scope, user, parsedPage, parsedLimit);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard/kpis'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('scope')),
    __param(4, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "kpis", null);
__decorate([
    (0, common_1.Get)('charts/lead-status-distribution'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('scope')),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getLeadStatusDistribution", null);
__decorate([
    (0, common_1.Get)('charts/revenue-trends'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRevenueTrends", null);
__decorate([
    (0, common_1.Get)('charts/activity-trends'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getActivityTrends", null);
__decorate([
    (0, common_1.Get)('charts/user-growth'),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getUserGrowth", null);
__decorate([
    (0, common_1.Get)('charts/lead-conversion-funnel'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('scope')),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getLeadConversionFunnel", null);
__decorate([
    (0, common_1.Get)('charts/sales-pipeline-flow'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSalesPipelineFlow", null);
__decorate([
    (0, common_1.Get)('charts/top-performers'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTopPerformers", null);
__decorate([
    (0, common_1.Get)('charts/lead-velocity'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDealVelocity", null);
__decorate([
    (0, common_1.Get)('charts/lead-source-distribution'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('scope')),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getLeadSourceDistribution", null);
__decorate([
    (0, common_1.Get)('reports/task'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTaskReport", null);
__decorate([
    (0, common_1.Get)('reports/lead'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getLeadReport", null);
__decorate([
    (0, common_1.Get)('reports/deal'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDealReport", null);
__decorate([
    (0, common_1.Get)('reports/expense'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getExpenseReport", null);
__decorate([
    (0, common_1.Get)('reports/invoice'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getInvoiceReport", null);
__decorate([
    (0, common_1.Get)('reports/quotation'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getQuotationReport", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map