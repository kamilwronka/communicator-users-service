import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Client } from '@aws-sdk/client-s3';

import { Relationship } from './entities/relationship.entity';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { IAWSConfig, IRabbitMqConfig } from 'src/config/types';
import { ChannelsModule } from 'src/channels/channels.module';

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
    ChannelsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { accessKeyId, secret } = configService.get<IAWSConfig>('aws');

        return new S3Client({
          region: 'eu-central-1',
          credentials: {
            accessKeyId,
            secretAccessKey: secret,
          },
        });
      },
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
