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
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('deals')
export class DealsController {
  constructor(private readonly deals: DealsService) { }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @User() user?: any,
  ) {
    return this.deals.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    }, user);
  }

  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.deals.getById(Number(id), user);
  }

  @Post()
  create(@Body() dto: CreateDealDto, @User() user?: any) {
    return this.deals.create(dto, user?.userId);
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
