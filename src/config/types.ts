import { RuntimeEnvironment } from 'src/types/common';

export interface IPostgresConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

export interface IRabbitMqConfig {
  host: string;
  port: string;
  password: string;
  user: string;
}

export interface IAppConfig {
  env: RuntimeEnvironment;
  port: number;
  jsonSizeLimit: string;
}

export interface IServicesConfig {
  servers: string;
  channels: string;
  cdn: string;
}

export interface IAWSConfig {
  accessKeyId: string;
  secret: string;
  bucketName: string;
}
