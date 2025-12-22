import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InvoiceTemplatesService } from './invoice-templates.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('business-settings/invoice-templates')
@UseGuards(AuthGuard('jwt'))
export class InvoiceTemplatesController {
    constructor(private readonly invoiceTemplatesService: InvoiceTemplatesService) { }

    @Get()
    async findAll() {
        const templates = await this.invoiceTemplatesService.findAll();
        return { success: true, data: templates };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const template = await this.invoiceTemplatesService.findOne(+id);
        return { success: true, data: template };
    }

    @Post()
    async create(@Body() data: any) {
        const template = await this.invoiceTemplatesService.create(data);
        return { success: true, data: template };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        const template = await this.invoiceTemplatesService.update(+id, data);
        return { success: true, data: template };
    }

    @Put(':id/set-default')
    async setDefault(@Param('id') id: string) {
        await this.invoiceTemplatesService.setDefault(+id);
        return { success: true, message: 'Default template updated' };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.invoiceTemplatesService.delete(+id);
        return { success: true, message: 'Template deleted' };
    }
}
