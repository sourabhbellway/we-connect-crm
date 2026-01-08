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
const initiate_voip_call_dto_1 = require("./dto/initiate-voip-call.dto");
const voip_webhook_dto_1 = require("./dto/voip-webhook.dto");
const voip_config_dto_1 = require("./dto/voip-config.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let CommunicationsController = class CommunicationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    listMeetings(leadId, user) {
        try {
            return this.service.listMeetings(Number(leadId), user);
        }
        catch (error) {
            console.error('Error in listMeetings:', error);
            throw error;
        }
    }
    listLeadComms(leadId, user) {
        return this.service.listLeadComms(Number(leadId), user);
    }
    listTemplates(type, active, page, limit, user) {
        return this.service.listTemplates({
            type,
            active,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        }, user);
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
    sendMeetingEmail(body) {
        return this.service.sendMeetingEmail(body);
    }
    listMessages(q, user) {
        return this.service.listMessages({
            leadId: q.leadId ? parseInt(q.leadId) : undefined,
            type: q.type,
            status: q.status,
            page: q.page ? parseInt(q.page) : 1,
            limit: q.limit ? parseInt(q.limit) : 10,
        }, user);
    }
    createLeadComm(dto) {
        return this.service.createLeadComm(dto);
    }
    getVoIPConfig(user) {
        return this.service.getVoIPConfig();
    }
    saveVoIPConfig(dto, user) {
        return this.service.saveVoIPConfig(dto);
    }
    initiateVoIPCall(dto, user) {
        return this.service.initiateVoIPCall(dto);
    }
    async generateTwiML(body) {
        return this.service.generateTwiML(body);
    }
    handleVoIPWebhook(dto) {
        return this.service.handleVoIPWebhook(dto);
    }
    getVoIPCallHistory(leadId, userId, status, region, page, limit, user) {
        return this.service.getVoIPCallHistory({
            leadId: leadId ? parseInt(leadId) : undefined,
            userId: userId ? parseInt(userId) : undefined,
            status,
            region,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        }, user);
    }
    getVoIPStatistics(user) {
        return this.service.getVoIPStatistics(user);
    }
    getVoIPWebhookUrl(baseUrl) {
        return this.service.getVoIPWebhookUrl(baseUrl);
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Get)('leads/:leadId/meetings'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "listMeetings", null);
__decorate([
    (0, common_1.Get)('leads'),
    __param(0, (0, common_1.Query)('leadId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "listLeadComms", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('active')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
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
    (0, common_1.Post)('send-meeting-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "sendMeetingEmail", null);
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_messages_query_1.ListMessagesQuery, Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "listMessages", null);
__decorate([
    (0, common_1.Post)('leads'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_communication_dto_1.CreateLeadCommunicationDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "createLeadComm", null);
__decorate([
    (0, common_1.Get)('voip/config'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "getVoIPConfig", null);
__decorate([
    (0, common_1.Post)('voip/config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [voip_config_dto_1.VoIPConfigDto, Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "saveVoIPConfig", null);
__decorate([
    (0, common_1.Post)('voip/initiate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_voip_call_dto_1.InitiateVoIPCallDto, Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "initiateVoIPCall", null);
__decorate([
    (0, common_1.Post)('voip/twiml'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "generateTwiML", null);
__decorate([
    (0, common_1.Post)('voip/webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [voip_webhook_dto_1.VoIPWebhookDto]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "handleVoIPWebhook", null);
__decorate([
    (0, common_1.Get)('voip/calls'),
    __param(0, (0, common_1.Query)('leadId')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('region')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "getVoIPCallHistory", null);
__decorate([
    (0, common_1.Get)('voip/stats'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "getVoIPStatistics", null);
__decorate([
    (0, common_1.Get)('voip/webhook-url'),
    __param(0, (0, common_1.Query)('baseUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "getVoIPWebhookUrl", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('communications'),
    __metadata("design:paramtypes", [communications_service_1.CommunicationsService])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map