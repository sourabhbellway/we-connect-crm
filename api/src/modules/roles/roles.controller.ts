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
import { RolesService } from './roles.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @RequirePermission('role.read')
  list(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('isDeleted') isDeleted?: string,
  ) {
    const isDeletedBool =
      isDeleted !== undefined &&
      String(isDeleted).toLowerCase().trim() === 'true';

    return this.service.list({
      search,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      isDeleted: isDeletedBool,
    });
  }

  @Post()
  @RequirePermission('role.create')
  create(@Body() dto: UpsertRoleDto) {
    return this.service.create(dto);
  }

  @Get(':id/users')
  @RequirePermission('role.read')
  getUsersByRole(@Param('id') id: string) {
    return this.service.getUsersByRole(Number(id));
  }

  @Put(':id')
  @RequirePermission('role.update')
  update(@Param('id') id: string, @Body() dto: UpsertRoleDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('role.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Delete(':id/permanent')
  @RequirePermission('role.delete')
  deletePermanently(@Param('id') id: string) {
    return this.service.deletePermanently(Number(id));
  }

  @Put(':id/restore')
  @RequirePermission('role.delete')
  restore(@Param('id') id: string) {
    return this.service.restore(Number(id));
  }
}
