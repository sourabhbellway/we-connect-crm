import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './src/modules/auth/auth.service';

async function test() {
    const jwt = new JwtService({ secret: 'testsecret', signOptions: { expiresIn: 86400 } });
    const config = new ConfigService();
    config.get = (key: string) => {
        if (key === 'auth.accessLifetimeHours') return 24;
        if (key === 'auth.refreshLifetimeDays') return 7;
        if (key === 'auth.bootstrapAdmin.enabled') return false;
        return null;
    };

    const auth = new AuthService({} as any, jwt, {} as any, config);

    const tokens1 = await (auth as any).generateAuthTokens(1, 'test@test.com');
    const decodedLogin = jwt.decode(tokens1.accessToken) as any;
    console.log('Login Flow Access Token:', decodedLogin);

    const decodedRefresh = jwt.decode(tokens1.refreshToken) as any;

    const tokens2 = await (auth as any).generateAuthTokens(decodedRefresh.userId, decodedRefresh.email);
    const decodedRefreshAccess = jwt.decode(tokens2.accessToken) as any;
    console.log('Refresh Flow Access Token:', decodedRefreshAccess);

    if (decodedLogin && decodedRefreshAccess) {
        const diff = Math.abs((decodedLogin.exp || 0) - (decodedRefreshAccess.exp || 0));
        console.log('Expiry difference (seconds):', diff);
    }
}
test().catch(console.error);
