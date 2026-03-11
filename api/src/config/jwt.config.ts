import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not defined. Application cannot start without it.',
    );
  }
  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
});
