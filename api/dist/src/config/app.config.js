"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    name: process.env.APP_NAME || 'WeConnect CRM API',
    port: parseInt(process.env.PORT || '3001', 10),
}));
//# sourceMappingURL=app.config.js.map