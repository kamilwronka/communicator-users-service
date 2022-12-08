import {
  MessageHandlerErrorBehavior,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

import { AddUserServerDto } from './dto/add-user-server.dto';
import { CreateServerDto } from './dto/create-server.dto';
import { DeleteUserServerDto } from './dto/delete-user-server.dto';
import { Server } from './entities/server.entity';

enum RoutingKey {
  SERVER_MEMBER_ADD = 'servers.members.add',
  SERVER_MEMBER_DELETE = 'servers.members.delete',
  SERVER_CREATE = 'servers.create',
  SERVER_UPDATE = 'servers.update',
  SERVER_DELETE = 'servers.delete',
}

enum Queue {
  SERVER_CREATE = 'users-server-create',
  SERVER_UPDATE = 'users-server-update',
  SERVER_DELETE = 'users-server-delete',
  SERVER_MEMBER_ADD = 'users-servers-member-add',
  SERVER_MEMBER_DELETE = 'users-servers-member-delete',
}

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Server)
    private serversRepo: Repository<Server>,
  ) {}
  private readonly logger = new Logger(ServersService.name);

  async getServerById(serverId: string): Promise<Server> {
    const server = await this.serversRepo.findOne({ where: { id: serverId } });

    return server;
  }

  async getUserServers(userId: string): Promise<Server[]> {
    const user = await this.usersRepo.findOne({
      where: [{ id: userId }],
      relations: ['servers'],
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user.servers;
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.SERVER_MEMBER_ADD,
    queue: Queue.SERVER_MEMBER_ADD,
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async addUserServer({ userId, serverId }: AddUserServerDto) {
    const server = await this.getServerById(serverId);

    if (!server) {
      throw new NotFoundException();
    }

    const user = await this.usersRepo.findOne({
      where: [{ id: userId }],
      relations: ['servers'],
    });

    if (user.servers) {
      user.servers.push(server);
    } else {
      user.servers = [server];
    }

    await this.usersRepo.save(user);
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.SERVER_MEMBER_DELETE,
    queue: Queue.SERVER_MEMBER_DELETE,
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async deleteUserServer({ userId, serverId }: DeleteUserServerDto) {
    const user = await this.usersRepo.findOne({
      where: [{ id: userId }],
      relations: ['servers'],
    });

    user.servers = user.servers.filter((server) => server.id !== serverId);

    await this.usersRepo.save(user);
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.SERVER_CREATE,
    queue: Queue.SERVER_CREATE,
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async createServer(data: CreateServerDto) {
    try {
      const server = await this.serversRepo.create(data);
      await this.serversRepo.save(server);
    } catch (error) {
      this.logger.error(`Unable to create server: ${JSON.stringify(error)}`);
      new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.SERVER_UPDATE,
    queue: Queue.SERVER_UPDATE,
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async updateServer({ id, ...data }: CreateServerDto) {
    try {
      await this.serversRepo
        .createQueryBuilder()
        .update(Server)
        .set(data)
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      this.logger.error(`Unable to update server: ${JSON.stringify(error)}`);
      new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.SERVER_DELETE,
    queue: Queue.SERVER_DELETE,
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async deleteServer({ id }: CreateServerDto) {
    try {
      await this.serversRepo
        .createQueryBuilder()
        .delete()
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      this.logger.error(`Unable to delete server: ${JSON.stringify(error)}`);
      new Nack();
    }
  }
}
