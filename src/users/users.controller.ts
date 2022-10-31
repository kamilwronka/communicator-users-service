import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserId } from 'src/decorators/userId.decorator';
import { CreateRelationshipInviteDto } from './dto/create-relationship-invite.dto';
import { CreateUserDto } from './dto/create-user-account.dto';

import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { RespondToRelationshipInviteDto } from './dto/respond-to-relationship-invite.dto';
import { UploadProfilePictureDto } from './dto/upload-profile-picture.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getUserData(@UserId() userId: string) {
    return this.usersService.findById(userId);
  }

  @Get('me/relationships')
  async getUserRelationships(@UserId() userId: string) {
    return this.usersService.getUserRelationships(userId);
  }

  @Post('me/profilePicture')
  async uploadProfilePicture(
    @Body() uploadProfilePictureData: UploadProfilePictureDto,
    @UserId() userId: string,
  ) {
    return this.usersService.uploadProfilePicture(
      uploadProfilePictureData,
      userId,
    );
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
    @Param('relationshipId') relationshipId: string,
    @Body() respondToRelationshipRequestData: RespondToRelationshipInviteDto,
  ) {
    return this.usersService.respondToRelationshipRequest(
      userId,
      relationshipId,
      respondToRelationshipRequestData,
    );
  }

  @Get('data/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  @Post('account')
  async createUserAccount(
    @Body() createUserAccountData: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUserAccount(createUserAccountData);
  }

  @Post('profile')
  async createUserProfile(
    @UserId() userId: string,
    @Body() createProfileData: CreateUserProfileDto,
  ): Promise<User> {
    return this.usersService.createUserProfile(createProfileData, userId);
  }
}
