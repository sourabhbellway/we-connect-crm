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
import { CallLogsService } from './call-logs.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('call-logs')
export class CallLogsController {
  constructor(private readonly service: CallLogsService) { }

  @Get()
  list(
    @Query('leadId') leadId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @User() user?: any
  ) {
    return this.service.list({
      leadId: leadId ? parseInt(leadId) : undefined,
      userId: userId ? parseInt(userId) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    }, user);
  }

  @Get('lead/:leadId')
  listByLead(@Param('leadId') leadId: string, @User() user?: any) {
    return this.service.list({
      leadId: parseInt(leadId),
    }, user);
  }

  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.service.getById(Number(id), user);
  }

  @Post()
  create(@Body() dto: CreateCallLogDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCallLogDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post('initiate')
  async initiate(@Body() dto: CreateCallLogDto, @Body('fcm') fcm?: string) {

    const result = await this.service.create(dto);

    if (fcm) {
      try {

      } catch (error) {
        console.error('Failed to send mobile notification:', error);
      }
    }

    return result;
  }
}
