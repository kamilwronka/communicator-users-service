import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/decorators/userId.decorator';
import { ServersService } from './servers.service';
import { Server } from './types/server';

@ApiTags('servers')
@Controller('')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get('me/servers')
  async getUserServers(@UserId() userId: string): Promise<Server[]> {
    return this.serversService.getUserServers(userId);
  }
}
