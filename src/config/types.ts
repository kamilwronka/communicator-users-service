import { RuntimeEnvironment } from 'src/types/common';

export interface PostgresConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

export interface RabbitMqConfig {
  host: string;
  port: string;
  password: string;
  user: string;
}

export interface AppConfig {
  env: RuntimeEnvironment;
  port: number;
  jsonSizeLimit: string;
}

export interface ServicesConfig {
  servers: string;
  channels: string;
  cdn: string;
}

export interface AWSConfig {
  accessKeyId: string;
  secret: string;
  bucketName: string;
}
