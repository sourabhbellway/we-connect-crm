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
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('lead-sources')
export class LeadSourcesController {
  constructor(private readonly service: LeadSourcesService) {}

  @Get()
  @RequirePermission('business_settings_lead_source.read')
  list() {
    return this.service.list();
  }

  @Post()
  @RequirePermission('business_settings_lead_source.create')
  create(@Body() dto: UpsertLeadSourceDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @RequirePermission('business_settings_lead_source.update')
  update(@Param('id') id: string, @Body() dto: UpsertLeadSourceDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('business_settings_lead_source.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
