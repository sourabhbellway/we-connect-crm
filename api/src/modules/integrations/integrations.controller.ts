import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';
import { UpsertIntegrationDto } from './dto/upsert-integration.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get()
  @RequirePermission('business_settings_integrations.read')
  list() {
    return this.service.list();
  }

  @Post()
  @RequirePermission('business_settings_integrations.update') // Creating is like updating the config
  create(@Body() dto: UpsertIntegrationDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @RequirePermission('business_settings_integrations.update')
  update(@Param('id') id: string, @Body() dto: UpsertIntegrationDto) {
    return this.service.update(Number(id), dto);
  }

  @Get(':id/logs')
  @RequirePermission('business_settings_integrations.read')
  logs(@Param('id') id: string) {
    return this.service.logs(Number(id));
  }
}
