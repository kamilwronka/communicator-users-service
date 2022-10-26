import { registerAs } from '@nestjs/config';
import { IServicesConfig } from './types';

export default registerAs('services', (): IServicesConfig => {
  const { ENV } = process.env;

  const isLocal = ENV === 'local';
  const mockSvcUrl = 'http://mockserver.mockserver:1080';

  let config: IServicesConfig;

  if (isLocal) {
    config = {
      servers: `${mockSvcUrl}/servers`,
      media: `${mockSvcUrl}/media`,
      channels: `${mockSvcUrl}/channels`,
    };
  } else {
    config = {
      servers: 'http://servers:4000',
      media: 'http://media:4000',
      channels: 'http://channels:4000',
    };
  }

  return config;
});
