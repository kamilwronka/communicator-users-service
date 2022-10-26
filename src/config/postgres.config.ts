import { registerAs } from '@nestjs/config';
import { IPostgresConfig } from './types';

export default registerAs('postgres', (): IPostgresConfig => {
  const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USERNAME,
    POSTGRES_PASSWORD,
    POSTGRES_DATABASE,
    ENV,
  } = process.env;

  return {
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT, 10) || 5432,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
    synchronize: ENV === 'dev' || ENV === 'local',
  };
});
