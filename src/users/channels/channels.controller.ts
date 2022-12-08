import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserId } from '../../decorators/userId.decorator';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Channel } from './types/channel';

@ApiTags('channels')
@Controller('')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get('me/channels')
  async getUserChannels(@UserId() userId: string): Promise<Channel[]> {
    return this.channelsService.getPrivateChannels(userId);
  }

  @Post('me/channels')
  async createChannel(
    @UserId() userId: string,
    @Body() { users }: CreateChannelDto,
  ): Promise<Channel> {
    return this.channelsService.createPrivateChannel(userId, users);
  }
}
