import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from '@nestjs/terminus/dist/errors/axios.error';
import { catchError, firstValueFrom } from 'rxjs';
import { ServicesConfig } from '../../config/types';

import { Server } from './types/server';
@Injectable()
export class ServersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(ServersService.name);

  async getUserServers(userId: string): Promise<Server[]> {
    const { servers } = this.configService.get<ServicesConfig>('services');

    const { data } = await firstValueFrom(
      this.httpService.get<Server[]>(`${servers}/internal/${userId}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw new BadGatewayException(error.response.data);
        }),
      ),
    );

    return data;
  }
}
