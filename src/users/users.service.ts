import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreateUserDto } from './dto/create-user-account.dto';
import { uploadAvatar } from 'src/services/media/media.service';
import { nanoid } from 'nanoid';
import { CreateRelationshipInviteDto } from './dto/create-relationship-invite.dto';
import {
  Relationship,
  RelationshipRequest,
  RelationshipStatus,
} from './entities/relationship.entity';
import { GCPubSubClient } from 'nestjs-google-pubsub-microservice';
import { configService } from 'src/config/config.service';
import { RespondToRelationshipInviteDto } from './dto/respond-to-relationship-invite.dto';
import { createPrivateChannel } from 'src/services/servers/servers.service';

const pubSubConfig = configService.getPubSubConfig();

const client = new GCPubSubClient(pubSubConfig);

enum RelationshipType {
  ACCEPTED = 'ACCEPTED',
  SENT_PENDING = 'SENT_PENDING',
  RECEIVED_PENDING = 'RECEIVED_PENDING',
  DECLINED = 'DECLINED',
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Relationship)
    private relationshipRepo: Repository<Relationship>,
  ) {}

  async find(email: string) {
    return this.repo.find({ email });
  }

  async findOne(userId: string) {
    if (!userId) {
      throw new NotFoundException();
    }

    const user = await this.repo.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findUserRelationships(userId: string) {
    const relationships = await this.relationshipRepo.find({
      where: [{ creator: userId }, { receiver: userId }],
      relations: ['creator', 'receiver'],
    });

    const userList = relationships.map((relationship: Relationship) => {
      const { status, receiver, creator, id } = relationship;

      let relationshipType = '';

      if (status === RelationshipStatus.ACCEPTED) {
        relationshipType = RelationshipType.ACCEPTED;
      }

      if (status === RelationshipStatus.DECLINED) {
        relationshipType = RelationshipType.DECLINED;
      }

      if (
        status === RelationshipStatus.PENDING &&
        receiver.user_id === userId
      ) {
        relationshipType = RelationshipType.RECEIVED_PENDING;
      }

      if (
        status === RelationshipStatus.PENDING &&
        receiver.user_id !== userId
      ) {
        relationshipType = RelationshipType.SENT_PENDING;
      }

      if (receiver.user_id === userId) {
        return {
          id: id,
          type: relationshipType,
          user: creator,
        };
      } else {
        return {
          id: id,
          type: relationshipType,
          user: receiver,
        };
      }
    });

    return userList;
  }

  async getUserRelationshipsInvites(userId: string) {
    const relationships = await this.relationshipRepo.find({
      where: [{ receiver: userId, status: RelationshipStatus.PENDING }],
      relations: ['creator', 'receiver'],
    });

    const userList = relationships.map((relationship: Relationship) => {
      return { id: relationship.id, user: relationship.creator };
    });

    return userList;
  }

  async getUserRelationshipsRequests(userId: string) {
    const relationships = await this.relationshipRepo.find({
      where: [{ creator: userId, status: RelationshipStatus.PENDING }],
      relations: ['creator', 'receiver'],
    });

    const userList = relationships.map((relationship: Relationship) => {
      return { id: relationship.id, user: relationship.receiver };
    });

    return userList;
  }

  async doesRelationshipExists(creator: User, receiver: User) {
    const relationship = await this.relationshipRepo.findOne({
      where: [
        { creator, receiver },
        { creator: receiver, receiver: creator },
      ],
    });

    return !!relationship;
  }

  async createRelationship(
    userId: string,
    createRelationshipInviteData: CreateRelationshipInviteDto,
  ) {
    if (userId === createRelationshipInviteData.user_id) {
      throw new BadRequestException('You cant add yourself.');
    }

    const user = await this.findOne(userId);
    const invitedUser = await this.findOne(
      createRelationshipInviteData.user_id,
    );

    if (!user || !invitedUser) {
      throw new NotFoundException();
    }

    const exists = await this.doesRelationshipExists(user, invitedUser);

    if (exists) {
      throw new UnprocessableEntityException('Already exists.');
    }

    const newRelationship: RelationshipRequest = {
      creator: user,
      receiver: invitedUser,
      status: RelationshipStatus.PENDING,
    };

    const response = await this.relationshipRepo.save(newRelationship);

    try {
      await client
        .emit('relationship-request', {
          channelId: response.receiver.user_id,
          message: {
            id: response.id,
            user: response.creator,
          },
        })
        .toPromise();
    } catch (error) {
      console.log(error);
    }

    return response;
  }

  async respondToRelationshipRequest(
    userId: string,
    relationshipId: string,
    data: RespondToRelationshipInviteDto,
  ) {
    const relationship = await this.relationshipRepo.findOne({
      where: [{ id: relationshipId }],
      relations: ['creator', 'receiver'],
    });

    // if (userId !== relationship.receiver.user_id) {
    //   throw new ForbiddenException();
    // }

    try {
      await createPrivateChannel([relationship.creator, relationship.receiver]);
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }

    return this.relationshipRepo.save({ ...relationship, status: data.status });
  }

  async createUserAccount({ user }: CreateUserDto) {
    const transformedUserId = user.user_id.replace('auth0|', '');

    try {
      const currentUser = await this.repo.find({
        user_id: transformedUserId,
        email: user.email,
      });

      if (currentUser.length > 0) {
        throw new UnprocessableEntityException('Account already exists.');
      }
    } catch (error) {
      throw new BadRequestException();
    }

    try {
      const newUser = await this.repo.create({
        user_id: transformedUserId,
        email: user.email,
      });

      const createdUser = await this.repo.save(newUser);

      return createdUser;
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

  async createUserProfile(
    { username, data }: CreateUserProfileDto,
    userId: string,
  ) {
    const user = await this.repo.findOne(userId);

    if (!user) {
      throw new BadRequestException('No such user.');
    }

    if (user.profile_created) {
      throw new BadRequestException('User already created profile.');
    }

    if (data) {
      const imageId = nanoid();

      const profilePictureUrl = await uploadAvatar(
        `avatars/${userId}/${imageId}.png`,
        data,
      );

      user.profile_picture_url = profilePictureUrl.file_url;
    }

    user.username = username;
    user.profile_created = true;

    return this.repo.save(user);
  }
}
