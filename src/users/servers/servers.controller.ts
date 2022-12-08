import {
  Controller,
  Get,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UserId } from 'src/decorators/userId.decorator';
import { Server } from './entities/server.entity';
import { ServersService } from './servers.service';

@Controller('')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me/servers')
  async getUserServers(@UserId() userId: string): Promise<Server[]> {
    return this.serversService.getUserServers(userId);
  }
}
