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

@Controller('business-settings/unit-types')
export class UnitTypesController {
  constructor(private readonly unitTypesService: UnitTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUnitTypeDto: CreateUnitTypeDto) {
    return this.unitTypesService.create(createUnitTypeDto);
  }

  @Get()
  findAll() {
    return this.unitTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitTypeDto: UpdateUnitTypeDto,
  ) {
    return this.unitTypesService.update(id, updateUnitTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitTypesService.remove(id);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.unitTypesService.toggleActive(id);
  }
}