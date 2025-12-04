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
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('deals')
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.deals.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.deals.getById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateDealDto) {
    return this.deals.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.deals.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deals.remove(Number(id));
  }
}
