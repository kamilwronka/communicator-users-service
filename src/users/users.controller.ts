import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserId } from 'src/decorators/userId.decorator';
import { CreateUserDto } from './dto/create-user-account.dto';

import { GetUserByIdParamsDto } from './dto/get-user-by-id.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  @ApiOkResponse({
    type: User,
  })
  async getUserData(@UserId() userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    type: User,
  })
  @Get('internal/:id')
  async getUserById(@Param() params: GetUserByIdParamsDto) {
    return this.usersService.findById(params.id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('internal')
  @ApiCreatedResponse({
    type: User,
  })
  async createUserAccount(
    @Body() createUserAccountData: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUserAccount(createUserAccountData);
  }
}
