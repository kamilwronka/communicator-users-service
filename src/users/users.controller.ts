import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserId } from 'src/decorators/user-id.decorator';
import { CreateUserDto } from './dto/create-user-account.dto';

import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getUserData(@UserId() userId: string) {
    const user = await this.usersService.findOne(userId);
    return user;
  }

  @Get('search')
  async searchUser(@Query() queryParams: { query: string }) {
    console.log(queryParams.query);
    const result = await this.usersService.searchForUser(queryParams.query);
    return result;
  }

  @Post('create/account')
  async createUser(
    @Body() createUserAccountData: CreateUserDto,
    @Headers() headers: any,
  ): Promise<User> {
    console.log(headers);
    return this.usersService.createUserAccount(createUserAccountData);
  }

  @Post('create/profile')
  async updateUser(
    @UserId() userId: string,
    @Body() finishUserCreationdata: CreateUserProfileDto,
  ): Promise<User> {
    return this.usersService.createUserProfile(finishUserCreationdata, userId);
  }
}
