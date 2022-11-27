import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user-account.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}
  private readonly logger = new Logger(UsersService.name);

  async findById(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findByUsername(username: string, throwOnFailure = true) {
    const user = await this.usersRepo.findOne({ where: { username } });

    if (!user && throwOnFailure) {
      throw new NotFoundException();
    }

    return user;
  }

  async createUserAccount({ user: { email } }: CreateUserDto) {
    const currentUser = await this.usersRepo.find({
      where: [{ email }],
    });

    if (currentUser.length > 0) {
      throw new UnprocessableEntityException('Account already exists');
    }

    const newUser = await this.usersRepo.create({
      email,
    });

    const createdUser = await this.usersRepo.save(newUser);

    return createdUser;
  }
}
