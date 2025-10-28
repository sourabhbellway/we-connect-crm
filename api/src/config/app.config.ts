import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'WeConnect CRM API',
  port: parseInt(process.env.PORT || '3001', 10),
}));
