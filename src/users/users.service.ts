import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '@elastic/elasticsearch';

import { User } from './entities/user.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreateUserDto } from './dto/create-user-account.dto';
import { uploadAvatar } from 'src/services/media/media.service';
import { nanoid } from 'nanoid';

const elasticClient = new Client({ node: 'http://elasticsearch:9200' });

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

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

  async searchForUser(query) {
    const result = await elasticClient.search({
      index: 'users',
      body: {
        query: {
          match: { username: query },
        },
      },
    });

    return result.body.hits.hits;
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
