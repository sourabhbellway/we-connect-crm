import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  @RequirePermission('business_settings_tax.create')
  create(@Body() createTaxDto: CreateTaxDto) {
    return this.taxesService.create(createTaxDto);
  }

  @Get()
  @RequirePermission('business_settings_tax.read')
  findAll() {
    return this.taxesService.findAll();
  }

  @Get(':id')
  @RequirePermission('business_settings_tax.read')
  findOne(@Param('id') id: string) {
    return this.taxesService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermission('business_settings_tax.update')
  update(@Param('id') id: string, @Body() updateTaxDto: UpdateTaxDto) {
    return this.taxesService.update(+id, updateTaxDto);
  }

  @Delete(':id')
  @RequirePermission('business_settings_tax.delete')
  remove(@Param('id') id: string) {
    return this.taxesService.remove(+id);
  }
}
