import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IServicesConfig } from 'src/config/types';
import { MediaService } from './media.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { media } = configService.get<IServicesConfig>('services');

        return {
          baseURL: media,
          maxRedirects: 5,
          timeout: 5000,
        };
      },
    }),
  ],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
