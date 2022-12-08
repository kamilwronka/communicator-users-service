import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from '@nestjs/terminus/dist/errors/axios.error';
import { catchError, firstValueFrom } from 'rxjs';
import { ServicesConfig } from '../../config/types';
import { Channel } from './types/channel';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getPrivateChannels(userId: string): Promise<Channel[]> {
    const { channels } = this.configService.get<ServicesConfig>('services');

    const { data } = await firstValueFrom(
      this.httpService
        .get<Channel[]>(`${channels}/internal/private/${userId}`)
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadGatewayException(error.response.data);
          }),
        ),
    );

    return data;
  }

  async createPrivateChannel(
    userId: string | undefined,
    users: string[],
  ): Promise<Channel> {
    const { channels } = this.configService.get<ServicesConfig>('services');
    const allUsers = [...(userId ? [userId] : []), ...users];

    const requestData = {
      type: 'PRIVATE',
      users: allUsers,
    };

    const { data } = await firstValueFrom(
      this.httpService
        .post<Channel>(`${channels}/internal/private`, requestData)
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadGatewayException(error.response.data);
          }),
        ),
    );

    return data;
  }
}
