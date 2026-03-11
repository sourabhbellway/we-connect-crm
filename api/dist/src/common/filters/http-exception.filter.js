"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        const isHttpException = exception instanceof common_1.HttpException ||
            (typeof exception === 'object' &&
                exception !== null &&
                'getStatus' in exception &&
                'getResponse' in exception);
        if (isHttpException) {
            const httpException = exception;
            const httpStatus = httpException.getStatus();
            const httpRes = httpException.getResponse();
            if (httpStatus === common_1.HttpStatus.BAD_REQUEST &&
                httpRes.message &&
                Array.isArray(httpRes.message)) {
                response.status(httpStatus).json({
                    success: false,
                    message: 'Validation failed',
                    errors: httpRes.errors ||
                        httpRes.message.map((msg) => ({
                            field: msg.split(' ')[0] || 'field',
                            messages: [msg],
                        })),
                });
                return;
            }
            if (httpRes && typeof httpRes === 'object') {
                response.status(httpStatus).json({
                    success: false,
                    ...httpRes,
                });
                return;
            }
            status = httpStatus;
            if (typeof httpRes === 'string') {
                message = httpRes;
            }
        }
        else {
            const anyException = exception;
            if (anyException?.code === 'P2002') {
                status = common_1.HttpStatus.BAD_REQUEST;
                const field = anyException.meta?.target?.[0] ?? 'Field';
                message = `${field} must be unique`;
            }
        }
        response.status(status).json({
            success: false,
            message,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map