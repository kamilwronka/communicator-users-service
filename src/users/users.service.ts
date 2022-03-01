import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '@elastic/elasticsearch';

import { User } from './entities/user.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreateUserAccountDto } from './dto/create-user-account.dto';
import { MessageResponseStatus } from 'src/enum/messageResponseStatus.enum';

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

  async createUserAccount({ user }: CreateUserAccountDto) {
    const transformedUserId = user.user_id.replace('auth0|', '');

    try {
      const currentUser = await this.repo.find({
        user_id: transformedUserId,
        email: user.email,
      });

      if (currentUser.length > 0) {
        return { status: MessageResponseStatus.FAILURE };
      }
    } catch (error) {
      return { status: MessageResponseStatus.FAILURE };
    }

    try {
      const newUser = await this.repo.create({
        user_id: transformedUserId,
        email: user.email,
      });

      const createdUser = await this.repo.save(newUser);

      return {
        status: MessageResponseStatus.SUCCESS,
        data: createdUser,
      };
    } catch (error) {
      return { status: MessageResponseStatus.FAILURE };
    }
  }

  async createUserProfile({ username }: CreateUserProfileDto, userId: string) {
    const user = await this.repo.findOne(userId);
    user.username = username;
    user.profile_created = true;

    await elasticClient.index({
      index: 'users',
      body: {
        user_id: user.user_id,
        username: user.username,
        profile_picture_url: user.profile_picture_url,
      },
    });

    return this.repo.save(user);
  }
}
