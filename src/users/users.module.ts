import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Client } from '@aws-sdk/client-s3';

import { ServersModule } from 'src/servers/servers.module';
import { Relationship } from './entities/relationship.entity';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { ICloudflareConfig, IRabbitMqConfig } from 'src/config/types';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Relationship]),
    ClientsModule.registerAsync([
      {
        name: 'GATEWAY',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const { user, password, host, port } =
            configService.get<IRabbitMqConfig>('rabbitmq');

          return {
            transport: Transport.RMQ,
            options: {
              urls: [`amqp://${user}:${password}@${host}:${port}`],
              queue: 'asdasd',
            },
          };
        },
      },
    ]),
    ServersModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { accountId, apiKey, secret } =
          configService.get<ICloudflareConfig>('cloudflare');

        return new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: apiKey,
            secretAccessKey: secret,
          },
        });
      },
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
