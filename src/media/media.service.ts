import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from '@nestjs/terminus/dist/errors/axios.error';

import { catchError, firstValueFrom } from 'rxjs';
import { TUploadFileData, TUploadFileResponse } from './types';

@Injectable()
export class MediaService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(MediaService.name);

  async uploadFile({
    key,
    file,
    mimeType,
  }: TUploadFileData): Promise<TUploadFileResponse> {
    const fileBase64 = file.buffer.toString('base64');
    const requestData = { key, file: fileBase64, mimeType };

    const { data } = await firstValueFrom(
      this.httpService.post<TUploadFileResponse>('/upload', requestData).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.message);
          throw new BadGatewayException(error.message);
        }),
      ),
    );

    return data;
  }
}
