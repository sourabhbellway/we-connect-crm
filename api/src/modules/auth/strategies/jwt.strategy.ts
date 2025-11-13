import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Support Authorization header and token passed via query param (for SSE)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          try {
            // Look for token in query params: ?token= or ?access_token=
            // Works for Server-Sent Events where headers cannot be set
            const token = (req?.query?.token as string) || (req?.query?.access_token as string);
            return token || null;
          } catch {
            return null;
          }
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret') ?? 'changeme',
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId ?? payload.sub, email: payload.email };
  }
}
