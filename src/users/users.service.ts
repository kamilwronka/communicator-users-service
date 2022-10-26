import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreateUserDto } from './dto/create-user-account.dto';
import { nanoid } from 'nanoid';
import { extension } from 'mime-types';
import { CreateRelationshipInviteDto } from './dto/create-relationship-invite.dto';
import {
  Relationship,
  RelationshipRequest,
  RelationshipStatus,
} from './entities/relationship.entity';
import { RespondToRelationshipInviteDto } from './dto/respond-to-relationship-invite.dto';
import { ClientProxy } from '@nestjs/microservices';
import { MediaService } from 'src/media/media.service';
import { ServersService } from 'src/servers/servers.service';

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
    @Inject('GATEWAY') private gatewayClient: ClientProxy,
    private readonly mediaService: MediaService,
    private readonly serversService: ServersService,
  ) {}
  private readonly logger = new Logger(UsersService.name);

  async find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async findOne(userId: string) {
    if (!userId) {
      throw new NotFoundException();
    }

    const user = await this.repo.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.repo.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findUserRelationships(userId: string) {
    const relationships = await this.relationshipRepo.find({
      where: [
        { creator: { user_id: userId } },
        { receiver: { user_id: userId } },
      ],
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
      where: [
        { receiver: { user_id: userId }, status: RelationshipStatus.PENDING },
      ],
      relations: ['creator', 'receiver'],
    });

    const userList = relationships.map((relationship: Relationship) => {
      return { id: relationship.id, user: relationship.creator };
    });

    return userList;
  }

  async getUserRelationshipsRequests(userId: string) {
    const relationships = await this.relationshipRepo.find({
      where: [
        { creator: { user_id: userId }, status: RelationshipStatus.PENDING },
      ],
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
    const invitedUser = await this.findByUsername(
      createRelationshipInviteData.username,
    );

    if (userId === invitedUser.user_id) {
      throw new BadRequestException('You cant add yourself.');
    }

    const user = await this.findOne(userId);

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
      await this.gatewayClient
        .emit('relationship-requests', {
          channelId: response.receiver.user_id,
          message: {
            id: response.id,
            user: response.creator,
          },
        })
        .subscribe();
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
      where: [{ id: parseInt(relationshipId, 10) }],
      relations: ['creator', 'receiver'],
    });

    // if (userId !== relationship.receiver.user_id) {
    //   throw new ForbiddenException();
    // }

    try {
      await this.serversService.createPrivateChannel([
        relationship.creator,
        relationship.receiver,
      ]);
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
        where: { user_id: transformedUserId, email: user.email },
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
    { username }: CreateUserProfileDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const user = await this.repo.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('No such user');
    }

    if (user.profile_created) {
      throw new BadRequestException('User already created profile');
    }

    if (file) {
      const imageId = nanoid();
      const { mimetype: mimeType } = file;
      const key = `avatars/${userId}/${imageId}.${extension(mimeType)}`;

      try {
        const profilePictureUrl = await this.mediaService.uploadFile({
          key,
          file,
          mimeType,
        });

        user.profile_picture_url = profilePictureUrl.fileUrl;
      } catch (error) {
        this.logger.error('Unable to upload profile picture.');
      }
    }

    user.username = username;
    user.profile_created = true;

    return this.repo.save(user);
  }
}
