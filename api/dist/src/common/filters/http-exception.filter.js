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
        let errorDetails = null;
        let debugInfo = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            }
            else if (res && typeof res === 'object') {
                const r = res;
                if (Array.isArray(r.message) && r.message.length > 0) {
                    message = r.message[0];
                }
                else if (typeof r.message === 'string') {
                    message = r.message;
                }
                else if (typeof r.error === 'string') {
                    message = r.error;
                }
                errorDetails = r;
                if (r.details) {
                    debugInfo = r.details;
                }
                if (r.error && typeof r.error === 'object') {
                    debugInfo = { ...debugInfo, ...r.error };
                }
            }
        }
        else {
            const anyException = exception;
            console.error('========================================');
            console.error('           UNHANDLED EXCEPTION          ');
            console.error('========================================');
            console.error('Timestamp:', new Date().toISOString());
            console.error('Full error object:', JSON.stringify(anyException, this.getAllPropertyNames(anyException), 2));
            console.error('Error name:', anyException?.name);
            console.error('Error code:', anyException?.code);
            console.error('Error message:', anyException?.message);
            console.error('Error meta:', anyException?.meta);
            console.error('Error stack:', anyException?.stack);
            if (anyException?.code?.startsWith('P')) {
                console.error('--- Prisma Error Details ---');
                console.error('Prisma code:', anyException.code);
                console.error('Prisma message:', anyException.message);
                console.error('Prisma meta:', JSON.stringify(anyException.meta, null, 2));
                console.error('---------------------------');
            }
            console.error('========================================\n');
            if (anyException?.code === 'P2002') {
                status = common_1.HttpStatus.BAD_REQUEST;
                const field = anyException.meta?.target?.[0] ?? 'Field';
                message = `${field} must be unique - "${anyException.meta?.target_value || ''}" already exists`;
                errorDetails = {
                    code: anyException.code,
                    message: anyException.message,
                    meta: anyException.meta,
                };
                debugInfo = {
                    table: anyException.meta?.target?.[0],
                    conflictingValue: anyException.meta?.target_value,
                };
            }
            else if (anyException?.code === 'P2003') {
                status = common_1.HttpStatus.BAD_REQUEST;
                message = `Referenced record does not exist: ${anyException.meta?.field_name || 'Unknown field'}`;
                errorDetails = {
                    code: anyException.code,
                    message: anyException.message,
                    meta: anyException.meta,
                };
                debugInfo = {
                    constraint: anyException.meta?.constraint,
                    field: anyException.meta?.field_name,
                };
            }
            else if (anyException?.code === 'P2025') {
                status = common_1.HttpStatus.NOT_FOUND;
                message = anyException.message || 'Record not found';
                errorDetails = {
                    code: anyException.code,
                    message: anyException.message,
                    meta: anyException.meta,
                };
            }
            else if (anyException?.code === 'P2014') {
                status = common_1.HttpStatus.BAD_REQUEST;
                message = `Invalid relation: ${anyException.message}`;
                errorDetails = {
                    code: anyException.code,
                    message: anyException.message,
                    meta: anyException.meta,
                };
            }
            else if (anyException?.code === 'P2016') {
                status = common_1.HttpStatus.BAD_REQUEST;
                message = `Query error: ${anyException.message}`;
                errorDetails = {
                    code: anyException.code,
                    message: anyException.message,
                    meta: anyException.meta,
                };
            }
            else {
                message = anyException?.message || 'Internal server error';
                debugInfo = {
                    name: anyException?.name,
                    code: anyException?.code,
                    message: anyException?.message,
                    meta: anyException?.meta,
                    table: anyException?.table,
                    column: anyException?.column,
                    constraint: anyException?.constraint,
                    stack: process.env.NODE_ENV === 'development' ? anyException?.stack : undefined,
                    fullError: this.sanitizeError(anyException),
                };
                errorDetails = {
                    message: anyException?.message,
                    code: anyException?.code,
                };
            }
        }
        const responseBody = {
            success: false,
            message,
        };
        if (errorDetails) {
            responseBody.error = errorDetails;
        }
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
            responseBody.debug = debugInfo;
        }
        if (process.env.NODE_ENV === 'development' && debugInfo?.stack) {
            responseBody.stack = debugInfo.stack;
        }
        response.status(status).json(responseBody);
    }
    getAllPropertyNames(obj) {
        const props = [];
        let proto = obj;
        while (proto) {
            Object.getOwnPropertyNames(proto).forEach(prop => {
                if (props.indexOf(prop) === -1 && prop !== 'constructor') {
                    props.push(prop);
                }
            });
            proto = Object.getPrototypeOf(proto);
        }
        return props;
    }
    sanitizeError(obj) {
        try {
            if (obj === null || obj === undefined)
                return obj;
            if (typeof obj !== 'object')
                return obj;
            if (typeof obj === 'function')
                return obj.toString();
            const result = {};
            const keys = Object.keys(obj);
            for (const key of keys) {
                try {
                    const value = obj[key];
                    if (typeof value === 'function') {
                        result[key] = '[Function]';
                    }
                    else if (typeof value === 'symbol') {
                        result[key] = value.toString();
                    }
                    else if (typeof value === 'object' && value !== null) {
                        if (key === 'stack' || key === 'message') {
                            result[key] = value;
                        }
                        else if (Object.keys(value).length < 10) {
                            result[key] = this.sanitizeError(value);
                        }
                        else {
                            result[key] = '[Complex Object]';
                        }
                    }
                    else {
                        result[key] = value;
                    }
                }
                catch (e) {
                    result[key] = '[Error accessing property]';
                }
            }
            return result;
        }
        catch (e) {
            return { error: 'Failed to serialize error object' };
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map