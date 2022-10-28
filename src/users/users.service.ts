import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
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
import { mapUserRelationships } from './helpers/mapUserRelationships.helper';

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

  async findById(userId: string) {
    const user = await this.repo.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findByUsername(username: string, throwOnFailure = true) {
    const user = await this.repo.findOne({ where: { username } });

    if (!user && throwOnFailure) {
      throw new NotFoundException();
    }

    return user;
  }

  async createUserAccount({ user }: CreateUserDto) {
    const transformedUserId = user.user_id.replace('auth0|', '');

    const currentUser = await this.repo.find({
      where: [{ user_id: transformedUserId }, { email: user.email }],
    });

    if (currentUser.length > 0) {
      throw new UnprocessableEntityException('Account already exists');
    }

    const newUser = await this.repo.create({
      user_id: transformedUserId,
      email: user.email,
    });

    const createdUser = await this.repo.save(newUser);

    return createdUser;
  }

  async createUserProfile(
    { username }: CreateUserProfileDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const user = await this.findById(userId);

    if (user.profile_created) {
      throw new BadRequestException('User already created profile');
    }

    const userByUsername = await this.findByUsername(username, false);

    if (userByUsername && userByUsername.username === username) {
      throw new BadRequestException('Username already exists');
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

  async findRelationshipById(relationshipId: string) {
    const relationship = await this.relationshipRepo.findOne({
      where: [{ id: parseInt(relationshipId, 10) }],
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
        { creator, receiver },
        { creator: receiver, receiver: creator },
      ],
    });

    return relationship;
  }

  async getUserRelationships(userId: string) {
    const relationships = await this.relationshipRepo.find({
      where: [
        { creator: { user_id: userId } },
        { receiver: { user_id: userId } },
      ],
      relations: ['creator', 'receiver'],
    });

    return mapUserRelationships(userId, relationships);
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

    const user = await this.findById(userId);

    const existingRelationship = await this.findRelationshipByUsers(
      user,
      invitedUser,
    );

    if (existingRelationship) {
      throw new UnprocessableEntityException('Already exists.');
    }

    const newRelationship: RelationshipRequest = {
      creator: user,
      receiver: invitedUser,
      status: RelationshipStatus.PENDING,
    };

    const response = await this.relationshipRepo.save(newRelationship);

    console.log(response);

    this.gatewayClient
      .emit('relationship-requests', {
        channelId: response.receiver.user_id,
        message: {
          id: response.id,
          user: response.creator,
        },
      })
      .subscribe();

    return response;
  }

  async respondToRelationshipRequest(
    userId: string,
    relationshipId: string,
    { status }: RespondToRelationshipInviteDto,
  ) {
    if (status === RelationshipStatus.PENDING) {
      throw new BadRequestException();
    }

    const relationship = await this.findRelationshipById(relationshipId);

    if (relationship.status !== RelationshipStatus.PENDING) {
      throw new BadRequestException();
    }

    if (userId !== relationship.receiver.user_id) {
      throw new ForbiddenException();
    }

    await this.serversService.createPrivateChannel([
      relationship.creator,
      relationship.receiver,
    ]);

    return this.relationshipRepo.save({ ...relationship, status });
  }
}
