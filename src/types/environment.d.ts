import { EEnvironment } from './config/types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      ENV: EEnvironment;
      POSTGRES_HOST: string;
      POSTGRES_PORT: number;
      POSTGRES_USERNAME: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE: string;
      RABBITMQ_USER: string;
      RABBITMQ_PASSWORD: string;
      RABBITMQ_HOST: string;
      RABBITMQ_PORT: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_S3_BUCKET_NAME: string;
      CDN_URL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
