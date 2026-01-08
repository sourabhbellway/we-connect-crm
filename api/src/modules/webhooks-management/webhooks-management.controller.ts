import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WebhooksManagementService } from './webhooks-management.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('webhooks-management')
export class WebhooksManagementController {
    constructor(private readonly service: WebhooksManagementService) { }

    @Get()
    list() {
        return this.service.list();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateWebhookDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWebhookDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }

    @Post(':id/test')
    test(@Param('id', ParseIntPipe) id: number) {
        return this.service.test(id);
    }
}
