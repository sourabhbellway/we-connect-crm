import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsService } from './permissions.service';

@UseGuards(AuthGuard('jwt'))
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  list() {
    return this.service.list();
  }
}
