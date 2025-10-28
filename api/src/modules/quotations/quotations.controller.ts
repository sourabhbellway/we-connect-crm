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
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpsertQuotationItemDto } from './dto/upsert-quotation-item.dto';
import { CreateQuotationItemDto } from './dto/create-quotation.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly service: QuotationsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      status,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateQuotationDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuotationDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateQuotationItemDto) {
    return this.service.addItem(Number(id), dto);
  }

  @Put('items/:itemId')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpsertQuotationItemDto,
  ) {
    return this.service.updateItem(Number(itemId), dto);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.service.removeItem(Number(itemId));
  }

  @Put(':id/send')
  send(@Param('id') id: string) {
    return this.service.markSent(Number(id));
  }

  @Put(':id/accept')
  accept(@Param('id') id: string) {
    return this.service.markAccepted(Number(id));
  }

  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.markRejected(Number(id));
  }

  @Post(':id/generate-invoice')
  generateInvoice(@Param('id') id: string) {
    return this.service.generateInvoice(Number(id));
  }
}
