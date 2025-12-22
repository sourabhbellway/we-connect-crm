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
}
