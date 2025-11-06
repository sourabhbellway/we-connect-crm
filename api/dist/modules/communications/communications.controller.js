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
exports.CommunicationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const communications_service_1 = require("./communications.service");
const create_lead_communication_dto_1 = require("./dto/create-lead-communication.dto");
const upsert_template_dto_1 = require("./dto/upsert-template.dto");
const send_email_dto_1 = require("./dto/send-email.dto");
const send_whatsapp_dto_1 = require("./dto/send-whatsapp.dto");
const send_templated_dto_1 = require("./dto/send-templated.dto");
const list_messages_query_1 = require("./dto/list-messages.query");
let CommunicationsController = class CommunicationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    listMeetings(leadId) {
        try {
            return this.service.listMeetings(Number(leadId));
        }
        catch (error) {
            console.error('Error in listMeetings:', error);
            throw error;
        }
    }
    listLeadComms(leadId) {
        return this.service.listLeadComms(Number(leadId));
    }
    listTemplates(type, active, page, limit) {
        return this.service.listTemplates({
            type,
            active,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });
    }
    createTemplate(dto) {
        return this.service.createTemplate(dto);
    }
    updateTemplate(id, dto) {
        return this.service.updateTemplate(Number(id), dto);
    }
    deleteTemplate(id) {
        return this.service.deleteTemplate(Number(id));
    }
    sendEmail(dto) {
        return this.service.sendEmail(dto);
    }
    sendWhatsApp(dto) {
        return this.service.sendWhatsApp(dto);
    }
    sendTemplated(dto) {
        return this.service.sendTemplated(dto);
    }
    listMessages(q) {
        return this.service.listMessages({
            leadId: q.leadId ? parseInt(q.leadId) : undefined,
            type: q.type,
            status: q.status,
            page: q.page ? parseInt(q.page) : 1,
            limit: q.limit ? parseInt(q.limit) : 10,
        });
    }
    createLeadComm(dto) {
        return this.service.createLeadComm(dto);
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Get)('leads/:leadId/meetings'),
    __param(0, (0, common_1.Param)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "listMeetings", null);
__decorate([
    (0, common_1.Get)('leads'),
    __param(0, (0, common_1.Query)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "listLeadComms", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('active')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_template_dto_1.UpsertTemplateDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_template_dto_1.UpsertTemplateDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)('send-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_email_dto_1.SendEmailDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('send-whatsapp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_whatsapp_dto_1.SendWhatsAppDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "sendWhatsApp", null);
__decorate([
    (0, common_1.Post)('send-templated'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_templated_dto_1.SendTemplatedDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "sendTemplated", null);
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_messages_query_1.ListMessagesQuery]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "listMessages", null);
__decorate([
    (0, common_1.Post)('leads'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_communication_dto_1.CreateLeadCommunicationDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "createLeadComm", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('communications'),
    __metadata("design:paramtypes", [communications_service_1.CommunicationsService])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map