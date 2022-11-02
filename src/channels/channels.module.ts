import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IServicesConfig } from 'src/config/types';
import { ChannelsService } from './channels.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { channels } = configService.get<IServicesConfig>('services');

        return {
          baseURL: channels,
          maxRedirects: 5,
          timeout: 5000,
        };
      },
    }),
  ],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
