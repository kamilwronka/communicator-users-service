import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
    return this.usersService.findOne(userId);
  }

  @Get('data/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get('search')
  async searchUser(@Query() queryParams: { query: string }) {
    console.log(queryParams.query);
    const result = await this.usersService.searchForUser(queryParams.query);
    return result;
  }

  @Post('account')
  async createUser(
    @Body() createUserAccountData: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUserAccount(createUserAccountData);
  }

  @Post('profile')
  async updateUser(
    @UserId() userId: string,
    @Body() finishUserCreationdata: CreateUserProfileDto,
  ): Promise<User> {
    return this.usersService.createUserProfile(finishUserCreationdata, userId);
  }
}
