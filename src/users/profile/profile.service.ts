import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IAWSConfig, IServicesConfig } from 'src/config/types';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { generateFileUploadData } from '../helpers/generateFileUploadData.helper';
import { Relationship } from '../relationships/entities/relationship.entity';
import { UsersService } from '../users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectRepository(Relationship)
    private relationshipRepo: Repository<Relationship>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly s3Client: S3Client,
  ) {}

  async create(userId: string, { username, avatar }: CreateProfileDto) {
    const userByUsername = await this.usersService.findByUsername(
      username,
      false,
    );

    if (userByUsername) {
      throw new UnprocessableEntityException('username taken');
    }

    const user = await this.usersService.findById(userId);

    if (user.profile_created) {
      throw new BadRequestException('profile already created');
    }

    if (avatar) {
      const { cdn } = this.configService.get<IServicesConfig>('services');

      user.avatar = `${cdn}/${avatar}`;
    }

    user.username = username;
    user.profile_created = true;

    return this.usersRepo.save(user);
  }

  async update(userId: string, data: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);

    Object.entries(data).map(([key, value]) => {
      user[key] = value;
    });

    return this.usersRepo.save(user);
  }

  async uploadAvatar(userId: string, { filename, size }: UploadAvatarDto) {
    const { bucketName } = this.configService.get<IAWSConfig>('aws');
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
