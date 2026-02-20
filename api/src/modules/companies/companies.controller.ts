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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from '../../common/decorators/user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) { }

  @Get()
  @RequirePermission('contact.read')
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @User() user?: any,
  ) {
    return this.companies.list(
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        search,
      },
      user,
    );
  }

  @Get(':id')
  @RequirePermission('contact.read')
  get(@Param('id') id: string, @User() user?: any) {
    return this.companies.getById(Number(id), user);
  }

  @Post()
  @RequirePermission('contact.create')
  create(@Body() dto: CreateCompanyDto, @User() user?: any) {
    return this.companies.create(dto, user?.userId);
  }

  @Put(':id')
  @RequirePermission('contact.update')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companies.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('contact.delete')
  remove(@Param('id') id: string) {
    return this.companies.remove(Number(id));
  }
}
