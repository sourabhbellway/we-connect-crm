import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PrismaService } from '../../database/prisma.service';

const multer = require('multer');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      storage: multer.diskStorage({
        destination: (req: any, file: any, cb: any) => cb(null, uploadDir),
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const hasDot =
            typeof file.originalname === 'string' &&
            file.originalname.lastIndexOf('.') !== -1;
          const ext = hasDot
            ? file.originalname.substring(file.originalname.lastIndexOf('.'))
            : '';
          cb(null, `file-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, PrismaService],
})
export class FilesModule {}
