import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserServersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
}
