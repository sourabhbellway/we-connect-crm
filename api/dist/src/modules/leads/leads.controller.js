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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const leads_service_1 = require("./leads.service");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
const convert_lead_dto_1 = require("./dto/convert-lead.dto");
const transfer_lead_dto_1 = require("./dto/transfer-lead.dto");
const bulk_assign_dto_1 = require("./dto/bulk-assign.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let LeadsController = class LeadsController {
    leads;
    constructor(leads) {
        this.leads = leads;
    }
    getStats() {
        return this.leads.getStats();
    }
    list(page, limit, status, search, isDeleted, assignedTo, user) {
        const isDeletedBool = isDeleted !== undefined && String(isDeleted).toLowerCase().trim() === 'true';
        return this.leads.list({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            status,
            search,
            isDeleted: isDeletedBool,
            assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
        }, user);
    }
    get(id, user) {
        return this.leads.getById(Number(id), user);
    }
    create(dto, user) {
        return this.leads.create(dto, user?.userId);
    }
    update(id, dto) {
        return this.leads.update(Number(id), dto);
    }
    remove(id) {
        return this.leads.remove(Number(id));
    }
    deletePermanently(id) {
        return this.leads.deletePermanently(Number(id));
    }
    transfer(id, dto) {
        return this.leads.transfer(Number(id), dto);
    }
    bulkAssign(dto) {
        return this.leads.bulkAssign(dto);
    }
    convert(id, dto) {
        return this.leads.convert(Number(id), dto);
    }
    async undoConversion(id) {
        return this.leads.undoLeadConversion(Number(id));
    }
    restore(id) {
        return this.leads.restore(Number(id));
    }
    async bulkImportLeads(file) {
        if (!file) {
            throw new common_1.BadRequestException('CSV file is required');
        }
        return this.leads.bulkImportFromCsv(file);
    }
    async bulkExport(res, status, search) {
        const csv = await this.leads.bulkExport({ status, search });
        const filename = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
        const bom = '\uFEFF';
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(Buffer.from(bom + csv, 'utf8'));
    }
    syncAllIntegrations() {
        return this.leads.syncAllIntegrations();
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('isDeleted')),
    __param(5, (0, common_1.Query)('assignedTo')),
    __param(6, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreateLeadDto, Object]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "deletePermanently", null);
__decorate([
    (0, common_1.Put)(':id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transfer_lead_dto_1.TransferLeadDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Put)('bulk/assign'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_assign_dto_1.BulkAssignDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Post)(':id/convert'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, convert_lead_dto_1.ConvertLeadDto]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "convert", null);
__decorate([
    (0, common_1.Post)(':id/undo-conversion'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "undoConversion", null);
__decorate([
    (0, common_1.Put)(':id/restore'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)('bulk/import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('csvFile', {
        fileFilter: (req, file, cb) => {
            if (!file.originalname.endsWith('.csv')) {
                return cb(new common_1.BadRequestException('Only CSV files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "bulkImportLeads", null);
__decorate([
    (0, common_1.Get)('bulk/export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "bulkExport", null);
__decorate([
    (0, common_1.Post)('integrations/sync-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "syncAllIntegrations", null);
exports.LeadsController = LeadsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map