import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { AxiosError } from '@nestjs/terminus/dist/errors/axios.error';
import { catchError, firstValueFrom } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChannelsService {
  constructor(private readonly httpService: HttpService) {}

  async createPrivateChannel(users: User[]): Promise<any> {
    const requestData = { type: 'PRIVATE', users };

    const { data } = await firstValueFrom(
      this.httpService.post('/', requestData).pipe(
        catchError((error: AxiosError) => {
          throw new BadGatewayException(error);
        }),
      ),
    );

    return data;
  }
}
