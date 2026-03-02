"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('auth', () => ({
    refreshLifetimeDays: parseInt(process.env.REFRESH_LIFETIME_DAYS || '7', 10),
    accessLifetimeHours: parseInt(process.env.ACCESS_LIFETIME_HOURS || '24', 10),
    bootstrapAdmin: {
        enabled: process.env.BOOTSTRAP_ADMIN === 'true',
        email: process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@weconnect.com',
        password: process.env.BOOTSTRAP_ADMIN_PASSWORD || 'admin123',
        roleName: process.env.BOOTSTRAP_ADMIN_ROLE || 'Admin',
    },
}));
//# sourceMappingURL=auth.config.js.map