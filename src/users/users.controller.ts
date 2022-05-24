import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserId } from 'src/decorators/user-id.decorator';
import { CreateRelationshipInviteDto } from './dto/create-relationship-invite.dto';
import { CreateUserDto } from './dto/create-user-account.dto';

import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { RespondToRelationshipInviteDto } from './dto/respond-to-relationship-invite.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getUserData(@UserId() userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get('me/relationships')
  async getUserRelationships(@UserId() userId: string) {
    return this.usersService.findUserRelationships(userId);
  }

  @Post('me/relationships')
  async createRelationshipInvite(
    @UserId() userId: string,
    @Body() createRelationshipInviteData: CreateRelationshipInviteDto,
  ) {
    return this.usersService.createRelationship(
      userId,
      createRelationshipInviteData,
    );
  }

  @Patch('me/relationships/:relationshipId')
  async respondToRelationshipRequest(
    @UserId() userId: string,
    @Body() respondToRelationshipRequestData: RespondToRelationshipInviteDto,
    @Param('relationshipId') relationshipId: string,
  ) {
    return this.usersService.respondToRelationshipRequest(
      userId,
      relationshipId,
      respondToRelationshipRequestData,
    );
  }

  @Get('me/relationships/invites')
  async getUserRelationshipsInvites(@UserId() userId: string) {
    return this.usersService.getUserRelationshipsInvites(userId);
  }

  @Get('me/relationships/requests')
  async getUserRelationshipsRequests(@UserId() userId: string) {
    return this.usersService.getUserRelationshipsRequests(userId);
  }

  @Get('data/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
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
