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

@UseGuards(AuthGuard('jwt'))
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) { }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @User() user?: any,
  ) {
    return this.companies.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    }, user);
  }

  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.companies.getById(Number(id), user);
  }

  @Post()
  create(@Body() dto: CreateCompanyDto, @User() user?: any) {
    return this.companies.create(dto, user?.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companies.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companies.remove(Number(id));
  }
}
