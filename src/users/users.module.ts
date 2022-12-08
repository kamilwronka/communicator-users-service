import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Client } from '@aws-sdk/client-s3';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { AWSConfig } from 'src/config/types';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { Relationship } from './relationships/entities/relationship.entity';
import { RelationshipsService } from './relationships/relationships.service';
import { RelationshipsController } from './relationships/relationships.controller';
import { ServersService } from './servers/servers.service';
import { ServersController } from './servers/servers.controller';
import { HttpModule } from '@nestjs/axios';
import { ChannelsService } from './channels/channels.service';
import { ChannelsController } from './channels/channels.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Relationship]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<RabbitMQConfig>('rabbitmq');

        return config;
      },
    }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: () => {
        return {
          maxRedirects: 5,
          timeout: 5000,
        };
      },
    }),
  ],
  controllers: [
    UsersController,
    ProfileController,
    RelationshipsController,
    ServersController,
    ChannelsController,
  ],
  providers: [
    UsersService,
    ProfileService,
    RelationshipsService,
    ServersService,
    ChannelsService,
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
  ],
  exports: [UsersService],
})
export class UsersModule {}
