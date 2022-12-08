import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Client } from '@aws-sdk/client-s3';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { AWSConfig } from 'src/config/types';
import { ChannelsModule } from 'src/channels/channels.module';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { Relationship } from './relationships/entities/relationship.entity';
import { RelationshipsService } from './relationships/relationships.service';
import { RelationshipsController } from './relationships/relationships.controller';
import { ServersService } from './servers/servers.service';
import { ServersController } from './servers/servers.controller';
import { Server } from './servers/entities/server.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Relationship, Server]),
    ChannelsModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<RabbitMQConfig>('rabbitmq');

        return config;
      },
    }),
  ],
  controllers: [
    UsersController,
    ProfileController,
    RelationshipsController,
    ServersController,
  ],
  providers: [
    UsersService,
    ProfileService,
    RelationshipsService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { accessKeyId, secret } = configService.get<AWSConfig>('aws');

        return new S3Client({
          region: 'eu-central-1',
          credentials: {
            accessKeyId,
            secretAccessKey: secret,
          },
        });
      },
    },
    ServersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
