import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeadSourcesService } from './lead-sources.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('lead-sources')
export class LeadSourcesController {
  constructor(private readonly service: LeadSourcesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() dto: UpsertLeadSourceDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpsertLeadSourceDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
