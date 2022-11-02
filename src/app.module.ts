import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import appConfig from './config/app.config';
import postgresConfig from './config/postgres.config';
import servicesConfig from './config/services.config';
import rabbitmqConfig from './config/rabbitmq.config';
import cloudflareConfig from './config/cloudflare.config';

import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';
import { EEnvironment, IPostgresConfig } from './config/types';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, username, password, database, synchronize } =
          configService.get<IPostgresConfig>('postgres');

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
        cloudflareConfig,
      ],
      cache: true,
      validationSchema: Joi.object({
        ENV: Joi.string()
          .valid(EEnvironment.LOCAL, EEnvironment.DEV, EEnvironment.PROD)
          .default(EEnvironment.LOCAL),
        PORT: Joi.number(),
        POSTGRES_HOST: Joi.string(),
        POSTGRES_PORT: Joi.string(),
        POSTGRES_USERNAME: Joi.string(),
        POSTGRES_PASSWORD: Joi.string(),
        POSTGRES_DATABASE: Joi.string(),
        RABBITMQ_USER: Joi.string(),
        RABBITMQ_PASSWORD: Joi.string(),
        RABBITMQ_HOST: Joi.string(),
        RABBITMQ_PORT: Joi.string(),
        CLOUDFLARE_ACCOUNT_ID: Joi.string(),
        CLOUDFLARE_ACCESS_KEY_ID: Joi.string(),
        CLOUDFLARE_SECRET_ACCESS_KEY: Joi.string(),
        CLOUDFLARE_R2_BUCKET_NAME: Joi.string(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    UsersModule,
    TerminusModule,
    ChannelsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
