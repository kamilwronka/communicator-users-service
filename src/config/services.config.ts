import { registerAs } from '@nestjs/config';
import { ServicesConfig } from './types';

export default registerAs('services', (): ServicesConfig => {
  const { ENV, CDN_URL } = process.env;

  const isLocal = ENV === 'local';
  const mockSvcUrl = 'http://mockserver.mockserver:1080';

  let config: ServicesConfig;

  if (isLocal) {
    config = {
      servers: `${mockSvcUrl}/servers`,
      channels: `${mockSvcUrl}/channels`,
      cdn: CDN_URL,
    };
  } else {
    config = {
      servers: 'http://servers:4000',
      channels: 'http://channels:4000',
      cdn: CDN_URL,
    };
  }

  return config;
});
