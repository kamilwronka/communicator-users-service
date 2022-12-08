import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import appConfig from './config/app.config';
import postgresConfig from './config/postgres.config';
import servicesConfig from './config/services.config';
import rabbitmqConfig from './config/rabbitmq.config';
import awsConfig from './config/aws.config';

import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';
import { PostgresConfig } from './config/types';

import { RuntimeEnvironment } from './types/common';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, username, password, database, synchronize } =
          configService.get<PostgresConfig>('postgres');

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          synchronize,
          entities: ['dist/**/*.entity{.ts,.js}'],
          migrationsTableName: 'migration',
          migrations: ['src/migration/*.ts'],
          cli: {
            migrationsDir: 'src/migration',
          },
          ssl: false,
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        postgresConfig,
        servicesConfig,
        rabbitmqConfig,
        awsConfig,
      ],
      cache: true,
      validationSchema: Joi.object({
        ENV: Joi.string()
          .valid(
            RuntimeEnvironment.LOCAL,
            RuntimeEnvironment.DEV,
            RuntimeEnvironment.STAGING,
            RuntimeEnvironment.PROD,
          )
          .default(RuntimeEnvironment.LOCAL),
        PORT: Joi.number(),
        POSTGRES_HOST: Joi.string(),
        POSTGRES_PORT: Joi.string(),
        POSTGRES_USERNAME: Joi.string(),
        POSTGRES_PASSWORD: Joi.string(),
        POSTGRES_DATABASE: Joi.string(),
        RABBITMQ_USER: Joi.string(),
        RABBITMQ_PASSWORD: Joi.string(),
        RABBITMQ_HOST: Joi.string(),
        RABBITMQ_ACCESS_PORT: Joi.string(),
        AWS_ACCESS_KEY_ID: Joi.string(),
        AWS_SECRET_ACCESS_KEY: Joi.string(),
        AWS_S3_BUCKET_NAME: Joi.string(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    UsersModule,
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
