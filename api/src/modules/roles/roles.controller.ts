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

@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('isDeleted') isDeleted?: string,
  ) {
    const isDeletedBool = isDeleted !== undefined && String(isDeleted).toLowerCase().trim() === 'true';
    
    return this.service.list({
      search,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      isDeleted: isDeletedBool,
    });
  }

  @Post()
  create(@Body() dto: UpsertRoleDto) {
    return this.service.create(dto);
  }

  @Get(':id/users')
  getUsersByRole(@Param('id') id: string) {
    return this.service.getUsersByRole(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpsertRoleDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Delete(':id/permanent')
  deletePermanently(@Param('id') id: string) {
    return this.service.deletePermanently(Number(id));
  }

  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(Number(id));
  }
}
