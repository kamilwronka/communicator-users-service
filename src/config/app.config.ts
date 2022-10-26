import { registerAs } from '@nestjs/config';
import { IAppConfig } from './types';

export default registerAs('app', (): IAppConfig => {
  const { ENV, PORT } = process.env;

  return { env: ENV, port: parseInt(PORT, 10) || 4000, jsonSizeLimit: '256kb' };
});
