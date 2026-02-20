import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @RequirePermission('user.read')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('isDeleted') isDeleted?: string,
  ) {
    const isDeletedBool =
      isDeleted !== undefined &&
      String(isDeleted).toLowerCase().trim() === 'true';

    return this.usersService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      status,
      isDeleted: isDeletedBool,
    });
  }

  @Get('stats')
  @RequirePermission('user.read')
  getStats() {
    return this.usersService.getStats();
  }

  @Get('profile')
  getMyProfile(@User() user: any) {
    if (!user?.userId && !user?.id)
      throw new BadRequestException('Invalid user context');
    const id = user.userId ?? user.id;
    return this.usersService.findOne(Number(id));
  }

  @Put('profile')
  updateMyProfile(@User() user: any, @Body() dto: UpdateProfileDto) {
    if (!user?.userId && !user?.id)
      throw new BadRequestException('Invalid user context');
    const id = user.userId ?? user.id;
    return this.usersService.updateProfile(Number(id), dto);
  }

  @Put('password')
  changeMyPassword(@User() user: any, @Body() dto: ChangePasswordDto) {
    if (!user?.userId && !user?.id)
      throw new BadRequestException('Invalid user context');
    const id = user.userId ?? user.id;
    return this.usersService.changePasswordForUser(
      Number(id),
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Put('password/new-user')
  changePasswordForNewUser(
    @User() user: any,
    @Body() dto: { newPassword: string },
  ) {
    if (!user?.userId && !user?.id)
      throw new BadRequestException('Invalid user context');
    const id = user.userId ?? user.id;
    return this.usersService.changePasswordForNewUser(
      Number(id),
      dto.newPassword,
    );
  }

  @Post('profile/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(
    @User() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!user?.userId && !user?.id)
      throw new BadRequestException('Invalid user context');
    if (!file) throw new BadRequestException('No file uploaded');
    const id = user.userId ?? user.id;
    const fileName = file.filename;
    return this.usersService.updateAvatar(Number(id), fileName);
  }

  @Put('profile/device-token')
  updateDeviceToken(@User() user: any, @Body() dto: { token: string }) {
    if (!user?.userId && !user?.id)
      throw new BadRequestException('Invalid user context');
    const id = user.userId ?? user.id;
    if (!dto.token) throw new BadRequestException('Token is required');
    return this.usersService.updateDeviceToken(Number(id), dto.token);
  }

  @Get(':id')
  @RequirePermission('user.read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id/role')
  @RequirePermission('role.update')
  assignRoles(@Param('id') id: string, @Body('roleIds') roleIds: number[]) {
    return this.usersService.assignRoles(Number(id), roleIds || []);
  }

  @Put(':id')
  @RequirePermission('user.update')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(id), dto);
  }

  @Post()
  @RequirePermission('user.create')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Delete(':id')
  @RequirePermission('user.delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }

  @Put(':id/restore')
  @RequirePermission('user.delete')
  restore(@Param('id') id: string) {
    return this.usersService.restore(Number(id));
  }

  @Delete(':id/permanent')
  @RequirePermission('user.delete')
  deletePermanently(@Param('id') id: string) {
    return this.usersService.deletePermanently(Number(id));
  }
}
