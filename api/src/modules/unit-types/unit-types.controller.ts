import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UnitTypesService } from './unit-types.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('business-settings/unit-types')
export class UnitTypesController {
  constructor(private readonly unitTypesService: UnitTypesService) {}

  @Post()
  @RequirePermission('unit_types.create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUnitTypeDto: CreateUnitTypeDto) {
    return this.unitTypesService.create(createUnitTypeDto);
  }

  @Get()
  @RequirePermission('unit_types.read')
  findAll() {
    return this.unitTypesService.findAll();
  }

  @Get(':id')
  @RequirePermission('unit_types.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitTypesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('unit_types.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitTypeDto: UpdateUnitTypeDto,
  ) {
    return this.unitTypesService.update(id, updateUnitTypeDto);
  }

  @Delete(':id')
  @RequirePermission('unit_types.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitTypesService.remove(id);
  }

  @Patch(':id/toggle')
  @RequirePermission('unit_types.update')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.unitTypesService.toggleActive(id);
  }
}
