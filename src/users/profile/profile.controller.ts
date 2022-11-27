import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Patch,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/decorators/userId.decorator';
import { User } from '../entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('me/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({
    type: User,
  })
  @Post('')
  async createUserProfile(
    @UserId() userId: string,
    @Body() data: CreateProfileDto,
  ): Promise<User> {
    return this.profileService.create(userId, data);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({
    type: User,
  })
  @Patch('')
  async updateUserProfile(
    @UserId() userId: string,
    @Body() data: UpdateProfileDto,
  ): Promise<User> {
    return this.profileService.update(userId, data);
  }

  @Put('avatar')
  async uploadAvatar(@UserId() userId: string, @Body() data: UploadAvatarDto) {
    return this.profileService.uploadAvatar(userId, data);
  }
}
