export enum EEnvironment {
  LOCAL = 'local',
  DEV = 'dev',
  PROD = 'prod',
}

export interface IEnvironmentVariables {
  ENV: EEnvironment;
  PORT: number;

  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USERNAME: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DATABASE: string;

  RABBITMQ_USER: string;
  RABBITMQ_PASSWORD: string;
  RABBITMQ_HOST: string;
  RABBITMQ_PORT: string;
}

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
  env: string;
  port: number;
  jsonSizeLimit: string;
}

export interface IServicesConfig {
  servers: string;
  media: string;
  channels: string;
}
