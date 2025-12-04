import { Body, Controller, Post, Get } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';
import { EmailWebhookDto } from './dto/email-webhook.dto';

// No auth guard - these endpoints are public for external providers to call
@Controller('communications/webhooks')
export class WebhooksController {
  constructor(private readonly service: CommunicationsService) {}

  @Post('whatsapp')
  async handleWhatsAppWebhook(@Body() dto: WhatsAppWebhookDto) {
    return this.service.handleWhatsAppWebhook(dto);
  }

  @Post('email')
  async handleEmailWebhook(@Body() dto: EmailWebhookDto) {
    return this.service.handleEmailWebhook(dto);
  }

  @Get('urls')
  getWebhookUrls() {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3010';
    return this.service.getWebhookUrls(baseUrl);
  }
}
