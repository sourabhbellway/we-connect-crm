const { JwtService } = require('@nestjs/jwt');
const { ConfigService } = require('@nestjs/config');
const { AuthService } = require('./src/modules/auth/auth.service');

async function test() {
    const jwt = new JwtService({ secret: 'testsecret', signOptions: { expiresIn: 86400 } });
    const config = new ConfigService();
    config.get = (key) => {
        if (key === 'auth.accessLifetimeHours') return 24;
        if (key === 'auth.refreshLifetimeDays') return 7;
        return null;
    };

    const auth = new AuthService(null, jwt, null, config);

    const tokens1 = await (auth.generateAuthTokens(1, 'test@test.com'));
    console.log('Login Flow Access Token:', jwt.decode(tokens1.accessToken));

    const decodedRefresh = jwt.decode(tokens1.refreshToken);

    const tokens2 = await (auth.generateAuthTokens(decodedRefresh.userId, decodedRefresh.email));
    console.log('Refresh Flow Access Token:', jwt.decode(tokens2.accessToken));

    // What if decodedRefresh is passed directly to signed? Oh wait generateAuthTokens takes userId, email precisely.
}
test().catch(console.error);
