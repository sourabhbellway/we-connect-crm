"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? [
                'http://31.97.233.21',
                'http://31.97.233.21:8081',
                'http://31.97.233.21:7001',
                'http://31.97.233.21:3001',
            ]
            : [
                'http://localhost:5173',
                'http://localhost:3000',
                'http://localhost:5174',
                'http://localhost:7001',
                'http://192.168.1.247:5173',
                'http://192.168.1.247:5174',
                'http://192.168.1.4:5173',
                'http://192.168.1.4:5174',
            ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map