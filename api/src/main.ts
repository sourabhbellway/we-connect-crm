import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve static uploads
  const uploadDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  // CORS configuration
  const corsOrigins = process.env.NODE_ENV === 'production'
    ? [
        'http://147.93.27.62',
        'http://147.93.27.62:4176',
        'http://147.93.27.62:3010',
        'http://31.97.233.21',
        'http://31.97.233.21:8081',
        'http://31.97.233.21:7001',
        'http://31.97.233.21:3001',
      ]
    : true; // Allow all origins in development

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-device-id', 'X-Device-Id'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
  });

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3010,
    '0.0.0.0',
  );
}
bootstrap();
