import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IServicesConfig } from 'src/config/types';
import { ServersService } from './servers.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { servers } = configService.get<IServicesConfig>('services');

        return {
          baseURL: servers,
          maxRedirects: 5,
          timeout: 5000,
        };
      },
    }),
  ],
  providers: [ServersService],
  exports: [ServersService],
})
export class ServersModule {}
