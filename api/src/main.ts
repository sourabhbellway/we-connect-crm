import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Increase body limit for logo uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to allow extra fields
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
      disableErrorMessages: false,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          const constraints = error.constraints || {};
          return Object.values(constraints).join(', ');
        });
        return new HttpException(
          {
            success: false,
            message: 'Validation failed',
            errors: messages
          },
          HttpStatus.BAD_REQUEST,
        );
      },
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
