import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { UserId } from 'src/decorators/user-id.decorator';
import { CreateUserAccountDto } from './dto/create-user-account.dto';

import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getUserData(@UserId() userId: string) {
    const user = await this.usersService.findOne(userId);
    return user;
  }

  @MessagePattern({ cmd: 'me' })
  async getUserDataEvent(userId: string) {
    const user = await this.usersService.findOne(userId);
    return user;
  }

  @Post('create/profile')
  async updateUser(
    @UserId() userId: string,
    @Body() finishUserCreationdata: CreateUserProfileDto,
  ): Promise<any> {
    const user = await this.usersService.createUserProfile(
      finishUserCreationdata,
      userId,
    );
    return user;
  }

  @Get('search')
  async searchUser(@Query() queryParams: { query: string }) {
    console.log(queryParams.query);
    const result = await this.usersService.searchForUser(queryParams.query);
    return result;
  }

  @MessagePattern({ cmd: 'user_create' })
  async createUser(
    @Payload() createUserAccountData: CreateUserAccountDto,
    // @Ctx() context: RmqContext,
  ) {
    const user = await this.usersService.createUserAccount(
      createUserAccountData,
    );

    return user;
  }
}
