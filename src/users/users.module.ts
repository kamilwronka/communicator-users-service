import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from 'src/media/media.module';
import { ServersModule } from 'src/servers/servers.module';
import { Relationship } from './entities/relationship.entity';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Relationship]),
    ClientsModule.register([
      {
        name: 'GATEWAY',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://user:${process.env.RABBITMQ_PASS}@rabbitmq:5672`],
          queue: 'gateway_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    MediaModule,
    ServersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
