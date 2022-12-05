import { registerAs } from '@nestjs/config';
import { AppConfig } from './types';

export default registerAs('app', (): AppConfig => {
  const { ENV, PORT } = process.env;

  return {
    env: ENV,
    port: PORT || 4000,
    jsonSizeLimit: '256kb',
  };
});
