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
import { IndustriesService } from './industries.service';
import { UpsertIndustryDto } from './dto/upsert-industry.dto';
import { UpsertIndustryFieldDto } from './dto/upsert-industry-field.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('industries')
export class IndustriesController {
  constructor(private readonly service: IndustriesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  @RequirePermission('industries.create')
  create(@Body() dto: UpsertIndustryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @RequirePermission('industries.update')
  update(@Param('id') id: string, @Body() dto: UpsertIndustryDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('industries.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post(':industryId/fields')
  @RequirePermission('industries.update')
  addField(
    @Param('industryId') industryId: string,
    @Body() dto: UpsertIndustryFieldDto,
  ) {
    return this.service.addField(Number(industryId), dto);
  }

  @Put('fields/:fieldId')
  @RequirePermission('industries.update')
  updateField(
    @Param('fieldId') fieldId: string,
    @Body() dto: UpsertIndustryFieldDto,
  ) {
    return this.service.updateField(Number(fieldId), dto);
  }

  @Delete('fields/:fieldId')
  @RequirePermission('industries.update')
  removeField(@Param('fieldId') fieldId: string) {
    return this.service.removeField(Number(fieldId));
  }
}
