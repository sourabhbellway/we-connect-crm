"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./src/modules/auth/auth.service");
async function test() {
    const jwt = new jwt_1.JwtService({ secret: 'testsecret', signOptions: { expiresIn: 86400 } });
    const config = new config_1.ConfigService();
    config.get = (key) => {
        if (key === 'auth.accessLifetimeHours')
            return 24;
        if (key === 'auth.refreshLifetimeDays')
            return 7;
        if (key === 'auth.bootstrapAdmin.enabled')
            return false;
        return null;
    };
    const auth = new auth_service_1.AuthService({}, jwt, {}, config);
    const tokens1 = await auth.generateAuthTokens(1, 'test@test.com');
    const decodedLogin = jwt.decode(tokens1.accessToken);
    console.log('Login Flow Access Token:', decodedLogin);
    const decodedRefresh = jwt.decode(tokens1.refreshToken);
    const tokens2 = await auth.generateAuthTokens(decodedRefresh.userId, decodedRefresh.email);
    const decodedRefreshAccess = jwt.decode(tokens2.accessToken);
    console.log('Refresh Flow Access Token:', decodedRefreshAccess);
    if (decodedLogin && decodedRefreshAccess) {
        const diff = Math.abs((decodedLogin.exp || 0) - (decodedRefreshAccess.exp || 0));
        console.log('Expiry difference (seconds):', diff);
    }
}
test().catch(console.error);
//# sourceMappingURL=test_jwt.js.map