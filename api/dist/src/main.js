"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const express = __importStar(require("express"));
const path_1 = require("path");
const fs = __importStar(require("fs"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        disableErrorMessages: false,
        exceptionFactory: (errors) => {
            const messages = errors.map(error => {
                const constraints = error.constraints || {};
                return Object.values(constraints).join(', ');
            });
            return new common_1.HttpException({
                success: false,
                message: 'Validation failed',
                errors: messages
            }, common_1.HttpStatus.BAD_REQUEST);
        },
    }));
    const uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadDir));
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
        : true;
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-device-id', 'X-Device-Id'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 3600,
    });
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3010, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map