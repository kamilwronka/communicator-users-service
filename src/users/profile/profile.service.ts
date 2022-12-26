import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as equal from 'deep-equal';

import { AWSConfig } from 'src/config/types';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { generateFileUploadData } from '../helpers/generateFileUploadData.helper';
import { UsersService } from '../users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { RoutingKeys } from '../../enums/routing-keys.enum';
import { DEFAULT_EXCHANGE_NAME } from 'src/config/rabbitmq.config';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly s3Client: S3Client,
    private readonly amqpConnection: AmqpConnection,
  ) { }

  async create(userId: string, { username, avatar }: CreateProfileDto) {
    const userByUsername = await this.usersService.findByUsername(
      username,
      false,
    );

    if (userByUsername) {
      throw new UnprocessableEntityException('username taken');
    }

    const user = await this.usersService.findById(userId);

    if (user.username) {
      throw new BadRequestException('profile already created');
    }

    if (avatar) {
      user.avatar = avatar;
    }

    user.username = username;

    const updatedUser = await this.usersRepo.save(user);

    this.amqpConnection.publish(
      DEFAULT_EXCHANGE_NAME,
      RoutingKeys.USER_UPDATE,
      updatedUser,
    );

    return updatedUser;
  }

  async update(userId: string, data: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);

    const hasChanged = !equal(
      {
        avatar: user.avatar,
        description: user.description,
      },
      { ...data },
      { strict: true },
    );

    if (hasChanged) {
      Object.entries(data).map(([key, value]) => {
        user[key] = value;
      });

      const updatedUser = await this.usersRepo.save(user);

      this.amqpConnection.publish(
        DEFAULT_EXCHANGE_NAME,
        RoutingKeys.USER_UPDATE,
        updatedUser,
        { deliveryMode: 2 },
      );

      return updatedUser;
    }

    return user;
  }

  async uploadAvatar(userId: string, { filename, size }: UploadAvatarDto) {
    const { bucketName } = this.configService.get<AWSConfig>('aws');
    const { key, mimeType } = generateFileUploadData(
      `users/${userId}`,
      filename,
    );

    const presignedUrl = await getSignedUrl(
      this.s3Client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: mimeType,
        ContentLength: size,
      }),
    );

    return { uploadUrl: presignedUrl, key };
  }
}
