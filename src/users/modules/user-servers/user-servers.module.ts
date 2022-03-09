import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../entities/user.entity';
import { UserServersController } from './user-servers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserServersController],
  providers: [],
  exports: [],
})
export class UserServersModule {}
