import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrashService } from './trash.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) { }

  @Get('stats')
  @RequirePermission('trash.read')
  getStats() {
    return this.trashService.getStats();
  }

  @Get()
  @RequirePermission('trash.read')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.trashService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      type: type || 'all',
      search: search || '',
    });
  }

  @Post(':type/:id/restore')
  @RequirePermission('trash.restore')
  @HttpCode(HttpStatus.OK)
  restore(@Param('type') type: string, @Param('id') id: string) {
    return this.trashService.restore(type, parseInt(id));
  }

  @Delete(':type/:id')
  @RequirePermission('trash.delete')
  @HttpCode(HttpStatus.OK)
  permanentDelete(@Param('type') type: string, @Param('id') id: string) {
    return this.trashService.permanentDelete(type, parseInt(id));
  }

  @Delete('empty/:type')
  @RequirePermission('trash.delete')
  @HttpCode(HttpStatus.OK)
  emptyTrash(@Param('type') type: string) {
    return this.trashService.emptyTrash(type);
  }
}
