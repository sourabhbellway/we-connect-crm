import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { User } from '../../common/decorators/user.decorator';
import * as fs from 'fs';
import * as path from 'path';

@UseGuards(AuthGuard('jwt'))
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) { }

  @Get()
  list(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @User() user?: any,
  ) {
    return this.service.list({
      entityType,
      entityId: entityId ? parseInt(entityId) : undefined,
    }, user);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: any,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @User() user: any,
    @Body('name') name?: string,
  ) {
    const userId: number | undefined = user?.userId;
    if (!userId) {
      throw new BadRequestException('Invalid user context');
    }
    const parsedEntityId = parseInt(entityId);
    if (!entityType || !parsedEntityId) {
      throw new BadRequestException('Entity type and ID are required');
    }
    return this.service.upload({
      file,
      entityType,
      entityId: parsedEntityId,
      uploadedBy: userId,
      name,
    });
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res() res: any,
    @Query('disposition') disposition?: 'inline' | 'attachment',
    @User() user?: any,
  ) {
    const record = await this.service.getById(Number(id), user);
    if (!record) throw new NotFoundException('File not found');
    const absPath = path.resolve(
      process.cwd(),
      record.filePath.replace(/^\//, ''),
    );
    if (!fs.existsSync(absPath))
      throw new NotFoundException('File not found on server');
    res.setHeader(
      'Content-Type',
      record.mimeType || 'application/octet-stream',
    );
    const disp = disposition === 'inline' ? 'inline' : 'attachment';
    res.setHeader(
      'Content-Disposition',
      `${disp}; filename="${encodeURIComponent(record.name)}"`,
    );
    return res.sendFile(absPath);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
