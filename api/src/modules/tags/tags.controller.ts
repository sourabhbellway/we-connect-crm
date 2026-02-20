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
import { TagsService } from './tags.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) { }

  @Get()
  @RequirePermission('tags.read')
  list() {
    return this.service.list();
  }

  @Post()
  @RequirePermission('tags.create')
  create(@Body() dto: UpsertTagDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @RequirePermission('tags.update')
  update(@Param('id') id: string, @Body() dto: UpsertTagDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('tags.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
