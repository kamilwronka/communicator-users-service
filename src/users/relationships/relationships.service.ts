import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { ChannelsService } from 'src/users/channels/channels.service';
import { Repository } from 'typeorm';
import { DEFAULT_EXCHANGE_NAME } from '../../config/rabbitmq.config';
import { User } from '../entities/user.entity';
import { mapUserRelationships } from './helpers/mapUserRelationships.helper';
import { UsersService } from '../users.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import {
  Relationship,
  RelationshipStatus,
} from './entities/relationship.entity';
import { RelationshipsRoutingKey } from './enums/relationships-routing-key.enum';

@Injectable()
export class RelationshipsService {
  constructor(
    @InjectRepository(Relationship)
    private relationshipRepo: Repository<Relationship>,
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async findRelationshipById(relationshipId: string) {
    const relationship = await this.relationshipRepo.findOne({
      where: [{ id: relationshipId }],
      relations: ['creator', 'receiver'],
    });

    if (!relationship) {
      throw new NotFoundException('No such relationship');
    }

    return relationship;
  }

  async findRelationshipByUsers(creator: User, receiver: User) {
    const relationship = await this.relationshipRepo.findOne({
      where: [
        { creator: { id: creator.id }, receiver: { id: receiver.id } },
        { creator: { id: receiver.id }, receiver: { id: creator.id } },
      ],
      relations: ['creator', 'receiver'],
    });

    return relationship;
  }

  async get(userId: string) {
    const relationships = await this.relationshipRepo.find({
      where: [{ creator: { id: userId } }, { receiver: { id: userId } }],
      relations: ['creator', 'receiver'],
    });

    return mapUserRelationships(userId, relationships);
  }

  async create(
    userId: string,
    createRelationshipInviteData: CreateRelationshipDto,
  ) {
    const invitedUser = await this.usersService.findByUsername(
      createRelationshipInviteData.username,
    );

    if (userId === invitedUser.id) {
      throw new BadRequestException('Wrong user id');
    }

    const user = await this.usersService.findById(userId);

    const existingRelationship = await this.findRelationshipByUsers(
      user,
      invitedUser,
    );

    if (existingRelationship) {
      throw new UnprocessableEntityException('relationship already exists');
    }

    const newRelationship = {
      id: nanoid(),
      creator: user,
      receiver: invitedUser,
      status: RelationshipStatus.PENDING,
    };

    const response = await this.relationshipRepo.save(newRelationship);

    this.publishEvent(RelationshipsRoutingKey.CREATE, response);

    return response;
  }

  async respond(
    userId: string,
    relationshipId: string,
    { status }: UpdateRelationshipDto,
  ) {
    if (status === RelationshipStatus.PENDING) {
      throw new BadRequestException();
    }

    const relationship = await this.findRelationshipById(relationshipId);

    if (relationship.status !== RelationshipStatus.PENDING) {
      throw new BadRequestException();
    }

    if (userId !== relationship.receiver.id) {
      throw new ForbiddenException();
    }

    const updatedRelationship = await this.relationshipRepo.save({
      ...relationship,
      status,
    });

    this.publishEvent(RelationshipsRoutingKey.UPDATE, updatedRelationship);

    return updatedRelationship;
  }

  publishEvent(routingKey: RelationshipsRoutingKey, message: Relationship) {
    console.log('publishing', routingKey);

    this.amqpConnection.publish(DEFAULT_EXCHANGE_NAME, routingKey, message, {
      deliveryMode: 2,
      persistent: true,
    });
  }
}
