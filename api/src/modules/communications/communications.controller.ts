import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommunicationsService } from './communications.service';
import { CreateLeadCommunicationDto } from './dto/create-lead-communication.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { SendTemplatedDto } from './dto/send-templated.dto';
import { ListMessagesQuery } from './dto/list-messages.query';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';
import { EmailWebhookDto } from './dto/email-webhook.dto';
import { InitiateVoIPCallDto } from './dto/initiate-voip-call.dto';
import { VoIPWebhookDto } from './dto/voip-webhook.dto';
import { VoIPConfigDto } from './dto/voip-config.dto';
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('communications')
export class CommunicationsController {
    constructor(private readonly service: CommunicationsService) { }

    // Specific routes first (more specific before generic)
    @Get('leads/:leadId/meetings')
    listMeetings(@Param('leadId') leadId: string, @User() user?: any) {
        try {
            return this.service.listMeetings(Number(leadId), user);
        } catch (error) {
            console.error('Error in listMeetings:', error);
            throw error;
        }
    }

    @Get('leads')
    listLeadComms(@Query('leadId') leadId: string, @User() user?: any) {
        return this.service.listLeadComms(Number(leadId), user);
    }

    // Templates
    @Get('templates')
    listTemplates(
        @Query('type') type?: string,
        @Query('active') active?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @User() user?: any,
    ) {
        return this.service.listTemplates({
            type,
            active,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        }, user);
    }

    @Post('templates')
    createTemplate(@Body() dto: UpsertTemplateDto) {
        return this.service.createTemplate(dto);
    }

    @Put('templates/:id')
    updateTemplate(@Param('id') id: string, @Body() dto: UpsertTemplateDto) {
        return this.service.updateTemplate(Number(id), dto);
    }

    @Delete('templates/:id')
    deleteTemplate(@Param('id') id: string) {
        return this.service.deleteTemplate(Number(id));
    }

    // Send endpoints
    @Post('send-email')
    sendEmail(@Body() dto: SendEmailDto) {
        return this.service.sendEmail(dto);
    }

    @Post('send-whatsapp')
    sendWhatsApp(@Body() dto: SendWhatsAppDto) {
        return this.service.sendWhatsApp(dto);
    }

    @Post('send-templated')
    sendTemplated(@Body() dto: SendTemplatedDto) {
        return this.service.sendTemplated(dto);
    }

    @Post('send-meeting-email')
    sendMeetingEmail(@Body() body: any) {
        return this.service.sendMeetingEmail(body);
    }

    // Messages listing
    @Get('messages')
    listMessages(@Query() q: ListMessagesQuery, @User() user?: any) {
        return this.service.listMessages({
            leadId: q.leadId ? parseInt(q.leadId) : undefined,
            type: q.type,
            status: q.status,
            page: q.page ? parseInt(q.page) : 1,
            limit: q.limit ? parseInt(q.limit) : 10,
        }, user);
    }

    @Post('leads')
    createLeadComm(@Body() dto: CreateLeadCommunicationDto) {
        return this.service.createLeadComm(dto);
    }

    // VoIP Configuration Endpoints
    @Get('voip/config')
    getVoIPConfig(@User() user?: any) {
        return this.service.getVoIPConfig();
    }

    @Post('voip/config')
    saveVoIPConfig(@Body() dto: VoIPConfigDto, @User() user?: any) {
        return this.service.saveVoIPConfig(dto);
    }

    // VoIP Call Endpoints
    @Post('voip/initiate')
    initiateVoIPCall(@Body() dto: InitiateVoIPCallDto, @User() user?: any) {
        return this.service.initiateVoIPCall(dto);
    }

    @Post('voip/twiml')
    async generateTwiML(@Body() body: any) {
        // Note: Twilio sends data as x-www-form-urlencoded.
        // Ensure your app can parse that, or use @Req if Body is empty.
        // Assuming global middleware or interceptor handles content-type.
        // Also, it's good practice to set Content-Type: text/xml response header.
        // But for simplicity in this controller we return the strong.
        // To strictly set XML, we'd need @Res() but that breaks standard return pattern.
        return this.service.generateTwiML(body);
    }

    @Post('voip/webhook')
    handleVoIPWebhook(@Body() dto: VoIPWebhookDto) {
        return this.service.handleVoIPWebhook(dto);
    }

    @Get('voip/calls')
    getVoIPCallHistory(
        @Query('leadId') leadId?: string,
        @Query('userId') userId?: string,
        @Query('status') status?: string,
        @Query('region') region?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @User() user?: any,
    ) {
        return this.service.getVoIPCallHistory({
            leadId: leadId ? parseInt(leadId) : undefined,
            userId: userId ? parseInt(userId) : undefined,
            status,
            region,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        }, user);
    }

    @Get('voip/stats')
    getVoIPStatistics(@User() user?: any) {
        return this.service.getVoIPStatistics(user);
    }

    @Get('voip/webhook-url')
    getVoIPWebhookUrl(@Query('baseUrl') baseUrl: string) {
        return this.service.getVoIPWebhookUrl(baseUrl);
    }
}
